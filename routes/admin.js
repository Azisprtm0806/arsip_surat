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
router.get("/data", adminController.dataDashboard);
// daftar user
router.get("/daftar", adminController.viewDaftar);
router.post("/daftar", uploadImageSingle, adminController.daftarUser);
router.get("/user/edit", adminController.viewEditUser);
router.post("/user/edit", uploadImageSingle, adminController.actionEditUser);
router.delete("/user/:id", adminController.deleteUser);
// profile
router.get("/profile", adminController.viewProfile);
// endpoint surat-masuk
router.get("/surat-masuk", adminController.viewSuratMasuk);
router.post("/surat-masuk", uploadFileSingle, adminController.addSuratMasuk);
router.get("/surat-masuk/:id", adminController.detailSuratMasuk);
router.put("/surat-masuk", uploadFileSingle, adminController.editSuratMasuk);
router.delete("/surat-masuk/:id", adminController.deleteSuratMasuk);
router.get("/surat-masuk-print", adminController.printSuratMasuk);
// dispsisi
router.get("/surat-masuk/disposisi/:masukId", adminController.viewDisposisi);
router.post("/surat-masuk/add/disposisi", adminController.addDisposisi);
router.get(
  "/surat-masuk/edit/disposisi/:id",
  adminController.viewDetailDisposisi
);
router.put("/surat-masuk/edit/disposisi", adminController.editDisposisi);
// endpoint surat-keluar
router.get("/surat-keluar", adminController.viewSuratKeluar);
router.post("/surat-keluar", uploadFileSingle, adminController.addSuratKeluar);
router.get("/surat-keluar/:id", adminController.detailSuratKeluar);
router.put("/surat-keluar", uploadFileSingle, adminController.editSuratKeluar);
router.delete("/surat-keluar/:id", adminController.deleteSuratKeluar);
router.get("/surat-keluar-print", adminController.printSuratKeluar);
// enpoint laporan
router.get("/laporan", adminController.viewLaporan);

module.exports = router;
