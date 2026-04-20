const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const authenticate = require('../middleware/auth.middleware');

const prisma = new PrismaClient();
const upload = multer({ dest: 'uploads/' });

router.post('/excel', authenticate, upload.single('archivo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Archivo requerido' });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const resultado = [];
    const errors = [];

    function parseDate(dateVal) {
      if (!dateVal) return new Date();
      if (typeof dateVal === 'string') return new Date(dateVal);
      if (typeof dateVal === 'number') return new Date((dateVal - 25569) * 86400 * 1000);
      return new Date();
    }

    // Intentar formato tabular primero
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    const headers = data[0] || [];
    const esFormatoTabular = headers[0]?.toString().toUpperCase().includes('CÉDULA') || headers[0]?.toString().toUpperCase().includes('CEDULA');

    if (esFormatoTabular) {
      for (let i = 3; i < data.length; i++) {
        const row = data[i];
        if (!row[0]) continue;
        try {
          const cedula = String(row[0]).replace(/[^\d]/g, '');
          const concepto = parseInt(row[1]);
          const fechaPago = row[2];
          const fechaNovedad = row[3];
          const numero = parseInt(row[4]) || 0;
          const valor = parseFloat(String(row[5]).replace(/[^\d.]/g, ''));
          const observacion = row[6] || '';
          const destino = row[7] || 'N';

          if (!cedula || !concepto || !valor) {
            errors.push({ fila: i + 1, error: 'Datos incompletos' });
            continue;
          }

          const viaje = await prisma.viajes.create({
            data: {
              cedula: BigInt(cedula),
              concepto,
              fecha_pago: parseDate(fechaPago),
              fecha_novedad: parseDate(fechaNovedad),
              numero,
              valor,
              observacion,
              destino: destino.toUpperCase(),
              usuario_id: req.user.id,
              estado: 'PENDIENTE'
            }
          });
          resultado.push(viaje);
        } catch (rowError) {
          errors.push({ fila: i + 1, error: rowError.message });
        }
      }
    } else {
      const nombre = sheet['C14']?.v || '';
      const cedula = sheet['N14']?.v || '';
      const mes = sheet['C19']?.v || '';
      const lugar = sheet['D46']?.v || '';
      const numDias = sheet['J46']?.v || 1;
      const tarifaDiaria = sheet['M46']?.v || 0;

      if (!cedula) {
        errors.push({ fila: 1, error: 'No se encontró cédula en el formulario' });
      } else {
        const meses = { 'ENERO':'01', 'FEBRERO':'02', 'MARZO':'03', 'ABRIL':'04', 'MAYO':'05', 'JUNIO':'06', 'JULIO':'07', 'AGOSTO':'08', 'SEPTIEMBRE':'09', 'OCTUBRE':'10', 'NOVIEMBRE':'11', 'DICIEMBRE':'12' };
        const mesNum = meses[mes?.toUpperCase()] || '01';
        const anio = new Date().getFullYear().toString();
        const fechaPago = `${anio}-${mesNum}-31`;
        const fechaNovedad = `${anio}-${mesNum}-31`;

        if (tarifaDiaria > 0) {
          const viaje1 = await prisma.viajes.create({
            data: {
              cedula: BigInt(cedula),
              concepto: 2018,
              fecha_pago: parseDate(fechaPago),
              fecha_novedad: parseDate(fechaNovedad),
              numero: 0,
              valor: tarifaDiaria,
              observacion: `${mes} - ${lugar} (${numDias} día(s)) - Tarifa diaria`,
              destino: 'N',
              usuario_id: req.user.id,
              estado: 'PENDIENTE'
            }
          });
          resultado.push(viaje1);
        }
      }
    }

    res.json({
      message: `Procesados ${resultado.length} registros`,
      exitosos: resultado.length,
      errores: errors.length,
      detalle: errors
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Error al procesar archivo' });
  }
});

router.get('/export', authenticate, async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const where = {};

    if (fecha_inicio && fecha_fin) {
      where.fecha_pago = { gte: new Date(fecha_inicio), lte: new Date(fecha_fin) };
    }

    const viajes = await prisma.viajes.findMany({ where, orderBy: { created_at: 'desc' } });

    // Leer archivo plantilla para copiar estructura y estilos
    const templateFile = path.join(__dirname, '../../formatos/centralizado.xlsx');

    // Leer plantilla con todas sus propiedades ( incluindo estilos)
    const templateWb = XLSX.readFile(templateFile, { cellStyles: true });
    const templateWs = templateWb.Sheets['FORMATO'];

    // Copiar Workbook completo para mantener estilos
    const wb = JSON.parse(JSON.stringify(templateWb));

    let ws = wb.Sheets['FORMATO'];

    // Limpiar datos antiguos (mantener filas 1-4)
    for (let r = 4; r < 100; r++) {
      for (let c = 0; c < 10; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        if (ws[cellRef]) {
          delete ws[cellRef];
        }
      }
    }

    // Escribir datos desde fila 5
    const startRow = 4;

    viajes.forEach((v, idx) => {
      const row = startRow + idx;
      const rowExcel = row + 1;

      let fechaPagoSerial = 46053;
      let fechaNovedadSerial = 46053;

      if (v.fecha_pago) {
        const d = new Date(v.fecha_pago);
        const diffTime = d.getTime() - new Date('1899-12-30').getTime();
        fechaPagoSerial = Math.floor(diffTime / (24 * 60 * 60 * 1000));
      }
      if (v.fecha_novedad) {
        const d = new Date(v.fecha_novedad);
        const diffTime = d.getTime() - new Date('1899-12-30').getTime();
        fechaNovedadSerial = Math.floor(diffTime / (24 * 60 * 60 * 1000));
      }

      // Copiar celda base de la plantilla y modificar solo el valor
      const baseCellA = templateWs ? templateWs['A5'] : null;
      const baseCellB = templateWs ? templateWs['B5'] : null;
      const baseCellC = templateWs ? templateWs['C5'] : null;
      const baseCellD = templateWs ? templateWs['D5'] : null;
      const baseCellE = templateWs ? templateWs['E5'] : null;
      const baseCellF = templateWs ? templateWs['F5'] : null;
      const baseCellG = templateWs ? templateWs['G5'] : null;
      const baseCellH = templateWs ? templateWs['H5'] : null;

      ws[`A${rowExcel}`] = baseCellA ? { ...baseCellA, t: 'n', v: BigInt(v.cedula.toString()) } : { t: 'n', v: BigInt(v.cedula.toString()) };
      ws[`B${rowExcel}`] = baseCellB ? { ...baseCellB, t: 'n', v: v.concepto } : { t: 'n', v: v.concepto };
      ws[`C${rowExcel}`] = baseCellC ? { ...baseCellC, t: 'n', v: fechaPagoSerial } : { t: 'n', v: fechaPagoSerial };
      ws[`D${rowExcel}`] = baseCellD ? { ...baseCellD, t: 'n', v: fechaNovedadSerial } : { t: 'n', v: fechaNovedadSerial };
      ws[`E${rowExcel}`] = baseCellE ? { ...baseCellE, t: 'n', v: v.numero } : { t: 'n', v: v.numero };
      ws[`F${rowExcel}`] = baseCellF ? { ...baseCellF, t: 'n', v: Number(v.valor) } : { t: 'n', v: Number(v.valor) };
      ws[`G${rowExcel}`] = baseCellG ? { ...baseCellG, t: 's', v: v.observacion } : { t: 's', v: v.observacion };
      ws[`H${rowExcel}`] = baseCellH ? { ...baseCellH, t: 's', v: v.destino } : { t: 's', v: v.destino };
    });

    // Actualizar rango
    if (viajes.length > 0) {
      ws['!ref'] = XLSX.utils.encode_range({
        s: { r: 0, c: 0 },
        e: { r: startRow + viajes.length, c: 7 }
      });
    }

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=viaticos_centralizado.xlsx');
    res.send(buffer);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Error al exportar' });
  }
});

module.exports = router;