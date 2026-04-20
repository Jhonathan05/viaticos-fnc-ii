const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const conceptos = await prisma.conceptos.findMany({
      orderBy: { codigo: 'asc' }
    });
    res.json(conceptos);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar conceptos' });
  }
});

module.exports = router;