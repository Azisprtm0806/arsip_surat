const router = require("express").Router();
const adminController = require("../controller/adminController");
const { uploadFileSingle } = require("../middleware/multer");
const { uploadImageSingle } = require("../middleware/multerImage");
const auth = require("../middleware/auth");

// forgot password
router.get("/forgot-password", adminController.forgotPassword);
router.post("/forgot-password", adminController.forgotPasswordAction);
// resert password
router.get("/reset-password/:token", adminController.viewResetPassword);
router.post("/reset-password/:token", adminController.resetPasswordAction);
// sign-in
router.get("/signin", adminController.viewSignin);
router.post("/signin", adminController.actionSignin);
router.use(auth);
router.get("/logout", adminController.actionLogout);
// dashboard
router.get("/dashboard", adminController.viewDashboard);
// daftar user
router.get("/daftar", adminController.viewDaftar);
router.post("/daftar", uploadImageSingle, adminController.daftarUser);
// profile
router.get("/profile", adminController.viewProfile);
// endpoint surat-masuk
router.get("/surat-masuk", adminController.viewSuratMasuk);
router.post("/surat-masuk", uploadFileSingle, adminController.addSuratMasuk);
router.get("/surat-masuk/:id", adminController.detailSuratMasuk);
router.put("/surat-masuk", uploadFileSingle, adminController.editSuratMasuk);
router.delete("/surat-masuk/:id", adminController.deleteSuratMasuk);
// dispsisi
router.get("/surat-masuk/disposisi/:masukId", adminController.viewDisposisi);
router.post("/surat-masuk/add/disposisi", adminController.addDisposisi);
// endpoint surat-keluar
router.get("/surat-keluar", adminController.viewSuratKeluar);
router.post("/surat-keluar", uploadFileSingle, adminController.addSuratKeluar);
router.get("/surat-keluar/:id", adminController.detailSuratKeluar);
router.put("/surat-keluar", uploadFileSingle, adminController.editSuratKeluar);
router.delete("/surat-keluar/:id", adminController.deleteSuratKeluar);
// enpoint laporan
router.get("/laporan", adminController.viewLaporan);

module.exports = router;
