const {
  createBusiness,
  getBusinessesByOwner,
  updateBusiness,
  deleteBusiness,
  listPublicBusinesses,
  getBusinessPublicById
} = require("./business.service");

// GET público: listar negocios con q, page, pageSize
async function getPublicBusinesses(req, res, next) {
  try {
    const { q, page, pageSize } = req.query || {};
    const data = await listPublicBusinesses({ q, page, pageSize });
    res.json(data);
  } catch (err) { next(err); }
}

// GET público: detalle negocio + servicios
async function getBusinessPublic(req, res, next) {
  try {
    const { id } = req.params;
    const business = await getBusinessPublicById(id);
    if (!business) return res.status(404).json({ message: "Negocio no encontrado" });
    res.json(business);
  } catch (err) { next(err); }
}
async function postBusiness(req, res, next) {
  try {
    const ownerId = req.user.sub;
    const { displayName, description, phone, email, timezone } = req.body;

    if (!displayName || !timezone) {
      return res.status(400).json({ message: "displayName y timezone son requeridos" });
    }

    const business = await createBusiness(ownerId, {
      displayName,
      description,
      phone,
      email,
      timezone
    });

    res.status(201).json(business);
  } catch (err) {
    next(err);
  }
}

async function getMyBusinesses(req, res, next) {
  try {
    const ownerId = req.user.sub;
    const businesses = await getBusinessesByOwner(ownerId);
    res.json(businesses);
  } catch (err) {
    next(err);
  }
}

async function putBusiness(req, res, next) {
  try {
    const ownerId = req.user.sub;
    const { id } = req.params;
    const { displayName, description, phone, email, timezone, isActive } = req.body;

    const result = await updateBusiness(id, ownerId, {
      displayName,
      description,
      phone,
      email,
      timezone,
      isActive
    });

    if (result.count === 0) {
      return res.status(404).json({ message: "Negocio no encontrado o no autorizado" });
    }

    res.json({ message: "Negocio actualizado" });
  } catch (err) {
    next(err);
  }
}

async function deleteBusinessCtrl(req, res, next) {
  try {
    const ownerId = req.user.sub;
    const { id } = req.params;

    const result = await deleteBusiness(id, ownerId);
    if (result.count === 0) {
      return res.status(404).json({ message: "Negocio no encontrado o no autorizado" });
    }

    res.json({ message: "Negocio desactivado" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  postBusiness,
  getMyBusinesses,
  putBusiness,
  deleteBusinessCtrl,
  getPublicBusinesses,
  getBusinessPublic
};
