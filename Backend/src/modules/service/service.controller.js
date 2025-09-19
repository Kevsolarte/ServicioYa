const {
  createService,
  getServicesByBusiness,
  updateService,
  deleteService
} = require("./service.service");

async function postService(req, res, next) {
  try {
    const ownerId = req.user.sub;
    const { businessId, name, description, price, durationMinutes } = req.body;

    if (!businessId || !name || !price || !durationMinutes) {
      return res.status(400).json({ message: "businessId, name, price y durationMinutes son requeridos" });
    }

    const service = await createService(ownerId, {
      businessId,
      name,
      description,
      price,
      durationMinutes
    });

    res.status(201).json(service);
  } catch (err) {
    next(err);
  }
}

async function getBusinessServices(req, res, next) {
  try {
    const { businessId } = req.params;
    const services = await getServicesByBusiness(businessId);
    res.json(services);
  } catch (err) {
    next(err);
  }
}

async function putService(req, res, next) {
  try {
    const ownerId = req.user.sub;
    const { id } = req.params;
    const data = req.body;

    const service = await updateService(ownerId, id, data);
    if (!service) return res.status(404).json({ message: "Servicio no encontrado o no autorizado" });

    res.json(service);
  } catch (err) {
    next(err);
  }
}

async function deleteServiceCtrl(req, res, next) {
  try {
    const ownerId = req.user.sub;
    const { id } = req.params;

    const service = await deleteService(ownerId, id);
    if (!service) return res.status(404).json({ message: "Servicio no encontrado o no autorizado" });

    res.json({ message: "Servicio desactivado" });
  } catch (err) {
    next(err);
  }
}
async function getServicePublic(req, res, next) {
  try {
    const { id } = req.params;
    const svc = await getServicePublicById(id);
    if (!svc) return res.status(404).json({ message: "Servicio no encontrado" });
    res.json(svc);
  } catch (err) { next(err); }
}

module.exports = {
  postService,
  getBusinessServices,
  putService,
  deleteServiceCtrl,
  getServicePublic
};
