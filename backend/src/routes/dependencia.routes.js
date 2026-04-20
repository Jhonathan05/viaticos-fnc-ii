const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const deps = await prisma.dependencias.findMany({
      orderBy: { nombre: 'asc' }
    });
    res.json(deps);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar dependencias' });
  }
});

module.exports = router;