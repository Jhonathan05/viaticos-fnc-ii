const express = require('express');
const router = express.Router();
const multer = require('multer');
const ExcelJS = require('exceljs');
const XLSX = require('xlsx');
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
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    const resultado = [];
    const errors = [];

    function parseDate(dateVal) {
      if (!dateVal) return new Date();
      if (typeof dateVal === 'string') return new Date(dateVal);
      if (typeof dateVal === 'number') return new Date((dateVal - 25569) * 86400 * 1000);
      return new Date();
    }

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
        const meses = { 'ENERO': '01', 'FEBRERO': '02', 'MARZO': '03', 'ABRIL': '04', 'MAYO': '05', 'JUNIO': '06', 'JULIO': '07', 'AGOSTO': '08', 'SEPTIEMBRE': '09', 'OCTUBRE': '10', 'NOVIEMBRE': '11', 'DICIEMBRE': '12' };
        const mesNum = meses[mes?.toUpperCase()] || '01';
        const anio = new Date().getFullYear().toString();
        const fechaPago = `${anio}-${mesNum}-31`;

        if (tarifaDiaria > 0) {
          const viaje1 = await prisma.viajes.create({
            data: {
              cedula: BigInt(cedula),
              concepto: 2018,
              fecha_pago: parseDate(fechaPago),
              fecha_novedad: parseDate(fechaPago),
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

// Converter date to Excel serial number
function dateToExcelSerial(date) {
  if (!date) return '';
  const d = new Date(date);
  // Excel serial: days since 1899-12-30
  return Math.floor((d.getTime() + d.getTimezoneOffset() * 60000) / 86400000) + 25569;
}

router.get('/export', authenticate, async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const where = {};

    if (fecha_inicio && fecha_fin) {
      where.fecha_pago = { gte: new Date(fecha_inicio), lte: new Date(fecha_fin) };
    }

    const viajes = await prisma.viajes.findMany({ where, orderBy: { created_at: 'desc' } });

    // Obtener usuarios para los nombres
    const usuarios = await prisma.users.findMany();
    const usuarioMap = {};
    usuarios.forEach(u => {
      usuarioMap[u.id] = u.nombre || u.username;
    });

    const path = require('path');
    const templatePath = path.join(__dirname, '../../formatos/centralizado.xlsx');


    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);

    const worksheet = workbook.getWorksheet('FORMATO');
    if (!worksheet) {
      throw new Error('No se encontró la hoja FORMATO en la plantilla');
    }

    // Actualizar fecha en fila 2, celda H (columna 8)
    const fechaActual = new Date();
    const cellFecha = worksheet.getRow(2).getCell(8);
    cellFecha.value = fechaActual;
    cellFecha.numFmt = 'dd/mm/yyyy';

    // Agregar datos a partir de la fila 5
    viajes.forEach((v, idx) => {
      const rowNum = 5 + idx;
      const row = worksheet.getRow(rowNum);

      // Cédula en columna A
      row.getCell(1).value = v.cedula.toString();

      // Concepto en columna B
      row.getCell(2).value = v.concepto;

      // Fechas como números de serie Excel
      row.getCell(3).value = v.fecha_pago ? dateToExcelSerial(v.fecha_pago) : '';
      row.getCell(3).numFmt = '0';

      row.getCell(4).value = v.fecha_novedad ? dateToExcelSerial(v.fecha_novedad) : '';
      row.getCell(4).numFmt = '0';

      // Número en columna E
      row.getCell(5).value = v.numero;
      row.getCell(5).numFmt = '0';

      // Valor en columna F
      row.getCell(6).value = Number(v.valor);
      row.getCell(6).numFmt = '0';

      // Observación en columna G
      row.getCell(7).value = v.observacion;

      // Destino en columna H
      row.getCell(8).value = v.destino;

      // Nombre en columna I (columna adicional que no formaba parte original de la tabla pero el export la añadía)
      const nombre = usuarioMap[v.cedula.toString()] || '';
      row.getCell(9).value = nombre;
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=viaticos_centralizado.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Error al exportar' });
  }
});

module.exports = router;