const { prisma } = require("../../config/db");

async function createBusiness(ownerId, data) {
  return prisma.business.create({
    data: {
      ownerId,
      displayName: data.displayName,
      description: data.description,
      phone: data.phone,
      email: data.email,
      timezone: data.timezone
    }
  });
}

async function getBusinessesByOwner(ownerId) {
  return prisma.business.findMany({
    where: { ownerId, isActive: true },
    orderBy: { createdAt: "desc" }
  });
}

async function updateBusiness(id, ownerId, data) {
  return prisma.business.updateMany({
    where: { id, ownerId },
    data
  });
}

async function deleteBusiness(id, ownerId) {
  return prisma.business.updateMany({
    where: { id, ownerId },
    data: { isActive: false }
  });
}
async function listPublicBusinesses({ q, page = 1, pageSize = 12 }) {
  const where = {
    isActive: true,
    ...(q
      ? {
        OR: [
          { displayName: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } }
        ]
      }
      : {})
  };

  const [total, items] = await prisma.$transaction([
    prisma.business.count({ where }),
    prisma.business.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
      select: {
        id: true,
        displayName: true,
        description: true,
        phone: true,
        email: true,
        timezone: true,
        createdAt: true,
      }
    })
  ]);

  const totalPages = Math.ceil(total / Number(pageSize)) || 1;

  return { items, page: Number(page), pageSize: Number(pageSize), total, totalPages };
}

// DETALLE DE NEGOCIO PÚBLICO + servicios activos
async function getBusinessPublicById(id) {
  return prisma.business.findFirst({
    where: { id, isActive: true },
    select: {
      id: true,
      displayName: true,
      description: true,
      phone: true,
      email: true,
      timezone: true,
      createdAt: true,
      services: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          durationMinutes: true,
          createdAt: true
        }
      }
    }
  });
}

module.exports = {
  createBusiness,
  getBusinessesByOwner,
  updateBusiness,
  deleteBusiness,
  listPublicBusinesses,
  getBusinessPublicById
};
