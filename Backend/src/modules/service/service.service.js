const { prisma } = require("../../config/db");

async function createService(ownerId, data) {
  // Validar que el negocio pertenece al owner
  const business = await prisma.business.findFirst({
    where: { id: data.businessId, ownerId }
  });
  if (!business) {
    throw Object.assign(new Error("Negocio no encontrado o no autorizado"), { status: 404 });
  }

  return prisma.service.create({
    data: {
      businessId: data.businessId,
      name: data.name,
      description: data.description,
      price: data.price,
      durationMinutes: data.durationMinutes
    }
  });
}

async function getServicesByBusiness(businessId) {
  return prisma.service.findMany({
    where: { businessId, isActive: true },
    orderBy: { createdAt: "desc" }
  });
}

async function updateService(ownerId, id, data) {
  // Validar ownership: join con business
  const service = await prisma.service.findFirst({
    where: { id, business: { ownerId } }
  });
  if (!service) return null;

  return prisma.service.update({
    where: { id },
    data
  });
}

async function deleteService(ownerId, id) {
  const service = await prisma.service.findFirst({
    where: { id, business: { ownerId } }
  });
  if (!service) return null;

  return prisma.service.update({
    where: { id },
    data: { isActive: false }
  });
}
async function getServicePublicById(id) {
  return prisma.service.findFirst({
    where: { id, isActive: true, business: { isActive: true } },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      durationMinutes: true,
      createdAt: true,
      business: {
        select: {
          id: true,
          displayName: true,
          timezone: true
        }
      }
    }
  });
}

module.exports = {
  createService,
  getServicesByBusiness,
  updateService,
  deleteService,
  getServicePublicById
};
