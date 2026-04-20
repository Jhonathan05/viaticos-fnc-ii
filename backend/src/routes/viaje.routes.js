const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authenticate = require('../middleware/auth.middleware');

router.get('/', authenticate, async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, cedula, estado } = req.query;
    const where = {};
    
    if (fecha_inicio && fecha_fin) {
      where.fecha_pago = {
        gte: new Date(fecha_inicio),
        lte: new Date(fecha_fin)
      };
    }
    if (cedula) where.cedula = BigInt(cedula);
    if (estado) where.estado = estado;

    const viajes = await prisma.viajes.findMany({
      where,
      include: { usuario: { select: { nombre: true } } },
      orderBy: { created_at: 'desc' }
    });
    // Convert BigInt to string for JSON serialization
    const viajesJson = viajes.map(v => ({
      ...v,
      cedula: v.cedula.toString()
    }));
    res.json(viajesJson);
  } catch (error) {
    console.error('List error:', error);
    res.status(500).json({ error: 'Error al listar' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const viaje = await prisma.viajes.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { usuario: { select: { nombre: true } } }
    });
    if (!viaje) return res.status(404).json({ error: 'No encontrado' });
    res.json({ ...viaje, cedula: viaje.cedula.toString() });
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { cedula, concepto, fecha_pago, fecha_novedad, numero, valor, observacion, destino, dependencia } = req.body;
    
    const viaje = await prisma.viajes.create({
      data: {
        cedula: BigInt(cedula),
        concepto,
        fecha_pago: new Date(fecha_pago),
        fecha_novedad: new Date(fecha_novedad),
        numero: numero || 0,
        valor,
        observacion,
        destino,
        dependencia,
        usuario_id: req.user.id,
        estado: 'PENDIENTE'
      }
    });
    res.status(201).json(viaje);
  } catch (error) {
    console.error('Create error:', error);
    res.status(500).json({ error: 'Error al crear' });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const { cedula, concepto, fecha_pago, fecha_novedad, numero, valor, observacion, destino, dependencia, estado } = req.body;
    
    const viaje = await prisma.viajes.update({
      where: { id: parseInt(req.params.id) },
      data: {
        cedula: cedula ? BigInt(cedula) : undefined,
        concepto,
        fecha_pago: fecha_pago ? new Date(fecha_pago) : undefined,
        fecha_novedad: fecha_novedad ? new Date(fecha_novedad) : undefined,
        numero,
        valor,
        observacion,
        destino,
        dependencia,
        estado,
        updated_at: new Date()
      }
    });
    res.json(viaje);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (req.user.rol !== 'ADMIN') {
      return res.status(403).json({ error: 'Solo administradores pueden eliminar' });
    }
    await prisma.viajes.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar' });
  }
});

module.exports = router;