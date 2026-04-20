const express = require('express');
const router = express.Router();
const multer = require('multer');
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

    const resultado = [];
    const errors = [];

    // Función para parsear fechas
    function parseDate(dateVal) {
      if (!dateVal) return new Date();
      if (typeof dateVal === 'string') return new Date(dateVal);
      if (typeof dateVal === 'number') return new Date((dateVal - 25569) * 86400 * 1000);
      return new Date();
    }

    // Intentar formato tabular primero (centralizado)
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    let formatoDetectado = 'tabular';

    // Verificar si es formato tabular (primera fila tiene headers conocidos)
    const headers = data[0] || [];
    const esFormatoTabular = headers[0]?.toString().toUpperCase().includes('CÉDULA') ||
                          headers[0]?.toString().toUpperCase().includes('CEDULA');

    if (esFormatoTabular) {
      // Procesar formato tabular
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
      // Es formato de formulario (pruebaBase) - extraer datos de celdas específicas
      formatoDetectado = 'formulario';

      const nombre = sheet['C14']?.v || '';
      const cedula = sheet['N14']?.v || '';
      const mes = sheet['C19']?.v || '';
      const motivo = sheet['F19']?.v || '';
      const lugar = sheet['D46']?.v || '';
      const diaIni = sheet['H46']?.v || '';
      const diaFin = sheet['I46']?.v || '';
      const numDias = sheet['J46']?.v || 1;
      const tarifaDiaria = sheet['M46']?.v || 0;
      const totalSinFacturas = sheet['L50']?.v || 0;
      const saldoFavor = sheet['L59']?.v || 0;

      if (!cedula) {
        errors.push({ fila: 1, error: 'No se encontró cédula en el formulario' });
      } else {
        // Convertir mes a fecha
        const meses = { 'ENERO':'01', 'FEBRERO':'02', 'MARZO':'03', 'ABRIL':'04', 'MAYO':'05', 'JUNIO':'06',
                      'JULIO':'07', 'AGOSTO':'08', 'SEPTIEMBRE':'09', 'OCTUBRE':'10', 'NOVIEMBRE':'11', 'DICIEMBRE':'12' };
        const mesNum = meses[mes?.toUpperCase()] || '01';
        const anio = new Date().getFullYear().toString();
        const fechaPago = `${anio}-${mesNum}-31`;
        const fechaNovedad = `${anio}-${mesNum}-31`;

        // Concepto 2018 - Tarifa diaria
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

        // Concepto 2028 - Total
        if (saldoFavor > 0) {
          const viaje2 = await prisma.viajes.create({
            data: {
              cedula: BigInt(cedula),
              concepto: 2028,
              fecha_pago: parseDate(fechaPago),
              fecha_novedad: parseDate(fechaNovedad),
              numero: 0,
              valor: saldoFavor,
              observacion: `${mes} - Total legalización ${nombre}`,
              destino: 'N',
              usuario_id: req.user.id,
              estado: 'PENDIENTE'
            }
          });
          resultado.push(viaje2);
        }
      }
    }

    res.json({
      message: `Procesados ${resultado.length} registros (formato: ${formatoDetectado})`,
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
      where.fecha_pago = {
        gte: new Date(fecha_inicio),
        lte: new Date(fecha_fin)
      };
    }

    const viajes = await prisma.viajes.findMany({
      where,
      include: { usuario: { select: { nombre: true } } },
      orderBy: { created_at: 'desc' }
    });

    // Crear libro estilo centralizado.xlsx
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([]);

    // Fila 1: Logo y Código
    XLSX.utils.sheet_add_aoa(ws, [['FECERACIÓN NACIONAL DE CAFETEROS DE COLOMBIA', null, null, null, null, null, 'CÓDIGO:', 'FE-GH-F-0157']], { origin: 'A1' });

    // Fila 2: Título y Fecha
    const fechaActual = new Date();
    const fechaSerial = Math.floor(fechaActual / (24 * 60 * 60 * 1000)) + 25569;
    XLSX.utils.sheet_add_aoa(ws, [['LEGALIZACIÓN COMISIONES DE TRABAJO DEPENDENCIAS', null, null, null, null, null, 'FECHA:', fechaSerial]], { origin: 'A2' });

    // Fila 3: Versión
    XLSX.utils.sheet_add_aoa(ws, [[null, null, null, null, null, null, 'VERSIÓN:', 1]], { origin: 'A3' });

    // Fila 4: Headers
    XLSX.utils.sheet_add_aoa(ws, [[
      '1\nCédula Empleado',
      '2\nConcepto',
      '3\nFecha de Pago (Ultimo día del mes de nómina)',
      '4\nFecha Aplica Novedad (Ultimo día del mes de nómina)',
      '5\nNúmero (siempre incluir el número 0)',
      '6\nValor anticipo o gasto',
      '7\nObservación de Legalización',
      '8\nDestino'
    ]], { origin: 'A4' });

    // Fila 5+: Datos
    const viajeRows = [];
    viajeRows.push(['', '', '', '', '', '', '', '', '']); // Empty row before data

    viajes.forEach(v => {
      // Convertir fechas a formato Excel serial
      let fechaPagoSerial = 46053; // Default: 2026-03-31
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

      viajeRows.push([
        v.cedula.toString(),
        v.concepto,
        fechaPagoSerial,
        fechaNovedadSerial,
        v.numero,
        Number(v.valor),
        v.observacion,
        v.destino
      ]);
    });

    // Add rows starting at row 6
    viajeRows.forEach((row, idx) => {
      XLSX.utils.sheet_add_aoa(ws, [row], { origin: `A${6 + idx}` });
    });

    XLSX.utils.book_append_sheet(wb, ws, 'FORMATO');

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