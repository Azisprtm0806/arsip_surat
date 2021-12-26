require("dotenv").config();
const SuratMasuk = require("../models/SuratMasuk");
const Disposisi = require("../models/Disposisi");
const SuratKeluar = require("../models/SuratKeluar");
const User = require("../models/User");
const path = require("path");
const fs = require("fs-extra");
const bcrypt = require("bcryptjs");
const { kirimEmail } = require("../helpers/sendMail");
const { buildPDF } = require("../helpers/pdf-service");

module.exports = {
  // sign-in
  viewSignin: async (req, res) => {
    try {
      const alertMessage = req.flash("alertMessage");
      const alertStatus = req.flash("alertStatus");
      const alert = {
        message: alertMessage,
        status: alertStatus,
      };

      if (req.session.user == null || req.session.user == undefined) {
        res.render("index", {
          alert: alert,
          title: "Arsip | Login",
        });
      } else {
        res.redirect("/admin/dashboard");
      }
    } catch (error) {
      res.redirect("/admin/signin");
    }
  },

  actionSignin: async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username: username });

      if (!user) {
        req.flash(
          "alertMessage",
          "Username Yang anda masukan tidak terdaftar!!"
        );
        req.flash("alertStatus", "danger");

        res.redirect("/admin/signin");
      }
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        req.flash("alertMessage", "Password Yang anda masukan tidak cocok!!");
        req.flash("alertStatus", "danger");

        res.redirect("/admin/signin");
      }
      req.session.user = {
        id: user.id,
        nama: user.nama,
        username: user.username,
        email: user.email,
        image: user.image,
      };
      res.redirect("/admin/dashboard");
    } catch (error) {
      res.redirect("/admin/signin");
    }
  },

  actionLogout: (req, res) => {
    req.session.destroy();
    res.redirect("/admin/signin");
  },

  // dashboard
  viewDashboard: async (req, res) => {
    const suratMasuk = await SuratMasuk.count();
    const suratKeluar = await SuratKeluar.count();
    const disposisi = await Disposisi.count();
    try {
      res.render("admin/dashboard/view_dashboard", {
        title: "Arsip | Dashboard",
        suratMasuk,
        suratKeluar,
        disposisi,
        user: req.session.user,
      });
    } catch (error) {
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/dashboard");
    }
  },

  dataDashboard: async (req, res) => {
    const suratMasuk = await SuratMasuk.count();
    const suratKeluar = await SuratKeluar.count();
    const disposisi = await Disposisi.count();
    const data = {
      suratMasuk,
      suratKeluar,
      disposisi,
    };
    try {
      res.status(200).json({
        data: data,
      });
    } catch (error) {
      console.log(err);
    }
  },
  // end Dashboard

  // surat-masuk
  viewSuratMasuk: async (req, res) => {
    try {
      const surat = await SuratMasuk.find();
      console.log(await surat.tglTerima);
      const alertMessage = req.flash("alertMessage");
      const alertStatus = req.flash("alertStatus");
      const alert = {
        message: alertMessage,
        status: alertStatus,
      };
      res.render("admin/surat_masuk/view_suratMasuk", {
        title: "Arsip | Surat Masuk",
        surat,
        alert,
        user: req.session.user,
      });
    } catch (error) {
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/surat-masuk");
    }
  },

  addSuratMasuk: async (req, res) => {
    try {
      const {
        tglSurat,
        tglTerima,
        noSurat,
        perihal,
        asalSurat,
        tujuan,
        keterangan,
      } = req.body;
      await SuratMasuk.create({
        tglSurat,
        tglTerima,
        noSurat,
        perihal,
        asalSurat,
        tujuan,
        keterangan,
        file: `file/${req.file.filename}`,
      });
      req.flash("alertMessage", "Succes Add Surat Masuk!!");
      req.flash("alertStatus", "success");
      res.redirect("/admin/surat-masuk");
    } catch (error) {
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/surat-masuk");
    }
  },

  detailSuratMasuk: async (req, res) => {
    const { id } = req.params;
    const surat = await SuratMasuk.findOne({ _id: req.params.id });
    const file = await SuratMasuk.findOne({ _id: id }).populate({
      path: "file",
      select: "id file",
    });
    try {
      res.render("admin/surat_masuk/show_detailMasuk", {
        title: "Arsip | Detail Surat Masuk",
        surat,
        file,
        user: req.session.user,
      });
    } catch (error) {
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/surat-masuk");
    }
  },

  editSuratMasuk: async (req, res) => {
    try {
      const {
        id,
        noSurat,
        tglSurat,
        tglTerima,
        perihal,
        asalSurat,
        tujuan,
        keterangan,
      } = req.body;
      const surat = await SuratMasuk.findOne({ _id: id });
      if (req.file == undefined) {
        surat.noSurat = noSurat;
        surat.tglSurat = tglSurat;
        surat.tglTerima = tglTerima;
        surat.perihal = perihal;
        surat.asalSurat = asalSurat;
        surat.tujuan = tujuan;
        surat.keterangan = keterangan;
        await surat.save();
        req.flash("alertMessage", "Success Edit Surat!");
        req.flash("alertStatus", "success");
        res.redirect("/admin/surat-masuk");
      } else {
        await fs.unlink(path.join(`public/${surat.file}`));
        surat.tglSurat = tglSurat;
        surat.tglTerima = tglTerima;
        surat.noSurat = noSurat;
        surat.perihal = perihal;
        surat.asalSurat = asalSurat;
        surat.tujuan = tujuan;
        surat.keterangan = keterangan;
        surat.file = `file/${req.file.filename}`;
        await surat.save();
        req.flash("alertMessage", "Success Edit Surat!");
        req.flash("alertStatus", "success");
        res.redirect("/admin/surat-masuk");
      }
    } catch (error) {
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/surat-masuk");
    }
  },

  deleteSuratMasuk: async (req, res) => {
    try {
      const { id } = req.params;
      const surat = await SuratMasuk.findOne({ _id: id }).populate(
        "disposisiId"
      );
      for (let i = 0; i < surat.disposisiId.length; i++) {
        Disposisi.findOne({ _id: surat.disposisiId[i]._id })
          .then((disposisi) => {
            disposisi.remove();
          })
          .catch((error) => {
            req.flash("alertMessage", `${(error, message)}`);
            req.flash("alertStatus", "danger");

            res.redirect("/admin/surat-masuk");
          });
      }
      await fs.unlink(path.join(`public/${surat.file}`));
      await surat.remove();
      req.flash("alertMessage", "Success Delete Surat Masuk!");
      req.flash("alertStatus", "success");
      res.redirect("/admin/surat-masuk");
    } catch (error) {
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/surat-masuk");
    }
  },
  printSuratMasuk: async (req, res) => {
    const surat = await SuratMasuk.find();
    res.render("admin/laporan/printMasuk", {
      surat,
    });
  },
  // end surat-masuk

  // disposisi
  viewDisposisi: async (req, res) => {
    const { masukId } = req.params;
    const dataDisposisi = await Disposisi.find({ masukId: masukId });
    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");
    const alert = {
      message: alertMessage,
      status: alertStatus,
    };
    try {
      res.render("admin/disposisi/view_disposisi", {
        title: "Arsip | Disposisi",
        alert,
        masukId,
        dataDisposisi,
        user: req.session.user,
      });
    } catch (error) {
      req.flash("alertMessage", `${(error, message)}`);
      req.flash("alertStatus", "danger");
    }
  },

  addDisposisi: async (req, res) => {
    // res.redirect(`/admin/surat-masuk/disposisi/${masukId}`);
    const { masukId, tujuan, sifat, batasWaktu } = req.body;
    try {
      const disposisi = await Disposisi.create({
        masukId,
        tujuan,
        sifat,
        batasWaktu,
      });
      const suratMasuk = await SuratMasuk.findOne({ _id: masukId });
      suratMasuk.disposisiId.push({ _id: disposisi._id });
      await suratMasuk.save();

      req.flash("alertMessage", "Success Add Disposisi!");
      req.flash("alertStatus", "success");
      res.redirect(`/admin/surat-masuk/disposisi/${masukId}`);
    } catch (error) {
      req.flash("alertMessage", `${error}`);
      req.flash("alertStatus", "danger");
      res.redirect(`/admin/surat-masuk/disposisi/${masukId}`);
    }
  },

  viewDetailDisposisi: async (req, res) => {
    const { id } = req.params;
    const disposisi = await Disposisi.findOne({ _id: id });
    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");
    const alert = {
      message: alertMessage,
      status: alertStatus,
    };
    try {
      res.render("admin/disposisi/show_disposisi", {
        title: "Arsip | Disposisi",
        disposisi,
        alert,
        user: req.session.user,
      });
    } catch (error) {
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect(`/admin/disposisi/${id}`);
    }
  },

  editDisposisi: async (req, res) => {
    try {
      const { id, tujuan, sifat, batasWaktu } = req.body;
      const disposisi = await Disposisi.findOne({ _id: id });
      disposisi.tujuan = tujuan;
      disposisi.sifat = sifat;
      disposisi.batasWaktu = batasWaktu;
      await disposisi.save();
      req.flash("alertMessage", "Success Edit Disposisi!");
      req.flash("alertStatus", "success");
      res.redirect(`/admin/surat-masuk/edit/disposisi/${id}`);
    } catch (error) {
      res.redirect(`/admin/surat-masuk/edit/disposisi/${id}`);
    }
  },

  // surat-keluar
  viewSuratKeluar: async (req, res) => {
    try {
      const alertMessage = req.flash("alertMessage");
      const alertStatus = req.flash("alertStatus");
      const alert = {
        message: alertMessage,
        status: alertStatus,
      };
      const surat = await SuratKeluar.find();
      res.render("admin/surat_keluar/view_suratKeluar", {
        title: "Arsip | Surat Keluar",
        alert,
        surat,
        user: req.session.user,
      });
    } catch (error) {
      res.redirect("/admin/surat-keluar");
    }
  },

  addSuratKeluar: async (req, res) => {
    try {
      const { tanggal, nomerSurat, tujuan, perihal, keterangan } = req.body;
      await SuratKeluar.create({
        tanggal,
        nomerSurat,
        tujuan,
        perihal,
        keterangan,
        file: `file/${req.file.filename}`,
      });
      req.flash("alertMessage", "Succes Add Surat Keluar!!");
      req.flash("alertStatus", "success");
      res.redirect("/admin/surat-keluar");
    } catch (error) {
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/surat-keluar");
    }
  },

  detailSuratKeluar: async (req, res) => {
    const { id } = req.params;
    const surat = await SuratKeluar.findOne({ _id: req.params.id });
    const file = await SuratKeluar.findOne({ _id: id }).populate({
      path: "file",
      select: "id file",
    });
    try {
      res.render("admin/surat_keluar/show_detailKeluar", {
        title: "Arsip | Detail Surat Keluar",
        surat,
        file,
        user: req.session.user,
      });
    } catch (error) {
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/surat-keluar");
    }
  },

  editSuratKeluar: async (req, res) => {
    try {
      const { id, tanggal, nomerSurat, tujuan, perihal, keterangan } = req.body;
      const surat = await SuratKeluar.findOne({ _id: id });
      if (req.file == undefined) {
        surat.tanggal = tanggal;
        surat.nomerSurat = nomerSurat;
        surat.tujuan = tujuan;
        surat.perihal = perihal;
        surat.keterangan = keterangan;
        await surat.save();
        req.flash("alertMessage", "Success Edit Surat Keluar!");
        req.flash("alertStatus", "success");
        res.redirect("/admin/surat-keluar");
      } else {
        await fs.unlink(path.join(`public/${surat.file}`));
        surat.tanggal = tanggal;
        surat.nomerSurat = nomerSurat;
        surat.tujuan = tujuan;
        surat.perihal = perihal;
        surat.keterangan = keterangan;
        surat.file = `file/${req.file.filename}`;
        await surat.save();
        req.flash("alertMessage", "Success Edit Surat!");
        req.flash("alertStatus", "success");
        res.redirect("/admin/surat-keluar");
      }
    } catch (error) {
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/surat-keluar");
    }
  },

  deleteSuratKeluar: async (req, res) => {
    try {
      const { id } = req.params;
      const surat = await SuratKeluar.findOne({ _id: id });
      await fs.unlink(path.join(`public/${surat.file}`));
      await surat.remove();
      req.flash("alertMessage", "Success Delete Surat Keluar!");
      req.flash("alertStatus", "success");
      res.redirect("/admin/surat-keluar");
    } catch (error) {
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/surat-keluar");
    }
  },
  printSuratKeluar: async (req, res) => {
    const surat = await SuratKeluar.find();
    res.render("admin/laporan/printKeluar", {
      surat,
    });
  },
  // end surat-keluar

  // laporan
  viewLaporan: async (req, res) => {
    const suratMasuk = await SuratMasuk.find();
    const suratKeluar = await SuratKeluar.find();
    const disposisi = await Disposisi.find();
    try {
      res.render("admin/laporan/view_laporan", {
        title: "Arsip | laporan",
        suratMasuk,
        suratKeluar,
        disposisi,
        user: {
          username: req.session.user.username,
          nama: req.session.user.nama,
        },
      });
    } catch (error) {}
  },
  // end laporan

  // profile
  viewProfile: (req, res) => {
    res.render("admin/user/profile", {
      title: "Arsip | Profile",
      user: {
        nama: req.session.user,
        username: req.session.user,
        email: req.session.user,
        image: req.session.user,
      },
    });
  },

  // daftar
  viewDaftar: async (req, res) => {
    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");
    const alert = {
      message: alertMessage,
      status: alertStatus,
    };
    const users = await User.find();
    res.render("admin/user/view_daftarUser", {
      title: "Arsip | Daftar User",
      alert,
      users,
      user: req.session.user,
    });
  },

  daftarUser: async (req, res) => {
    const { username, nama, email, password } = req.body;

    const usernameUser = await User.findOne({ username: username });
    const emailUser = await User.findOne({ email: email });

    if (usernameUser) {
      req.flash("alertMessage", "username sudah terdaftar!!");
      req.flash("alertStatus", "danger");
      res.redirect("/admin/daftar");
    }

    if (emailUser) {
      req.flash("alertMessage", "email sudah terdaftar!!");
      req.flash("alertStatus", "danger");
      res.redirect("/admin/daftar");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username: username,
      nama: nama,
      email: email,
      password: hashPassword,
      image: `images/${req.file.filename}`,
    });

    user.save();

    req.flash("alertMessage", "Succes Add User!!");
    req.flash("alertStatus", "success");
    res.redirect("/admin/daftar");
  },

  viewEditUser: (req, res) => {
    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");
    const alert = {
      message: alertMessage,
      status: alertStatus,
    };
    res.render("admin/user/form_edit", {
      title: "Arsip | Edit Profile",
      alert,
      user: {
        id: req.session.user,
        nama: req.session.user,
        username: req.session.user,
        email: req.session.user,
        image: req.session.user,
      },
    });
  },

  actionEditUser: async (req, res) => {
    try {
      const { id, nama, username, email } = req.body;
      const user = await User.findOne({ _id: id });
      if (req.file == undefined) {
        user.nama = nama;
        user.username = username;
        user.email = email;
        await user.save();
        req.flash(
          "alertMessage",
          "SUCCESS EDIT PROFILE! LOGOUT DAN LOGIN KEMBALI JIKA INGIN MELIHAT PERUBAHAN"
        );
        req.flash("alertStatus", "success");
        res.redirect("/admin/user/edit");
      } else {
        await fs.unlink(path.join(`public/${user.image}`));
        user.nama = nama;
        user.username = username;
        user.email = email;
        user.image = `images/${req.file.filename}`;
        await user.save();
        req.flash(
          "alertMessage",
          "SUCCESS EDIT PROFILE! LOGOUT DAN LOGIN KEMBALI JIKA INGIN MELIHAT PERUBAHAN"
        );
        req.flash("alertStatus", "success");
        res.redirect("/admin/user/edit");
      }
    } catch (error) {
      console.log(error);
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findOne({ _id: id });
      await fs.unlink(path.join(`public/${user.image}`));
      await user.remove();
      req.flash("alertMessage", "Success Delete User!");
      req.flash("alertStatus", "success");
      res.redirect("/admin/daftar");
    } catch (error) {
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/daftar");
    }
  },

  // reset password
  viewResetPassword: (req, res) => {
    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");
    const alert = {
      message: alertMessage,
      status: alertStatus,
    };
    res.render("admin/user/view_resetPass", {
      title: "Arsip | Reset Password",
      alert,
      user: req.session.user,
    });
  },

  resetPasswordAction: async (req, res) => {
    const { username, password } = req.body;

    try {
      const user = await User.findOne({ username: username });
      if (user) {
        const hashPassword = await bcrypt.hash(password, 10);
        user.password = hashPassword;
        await user.save();
        req.flash("alertMessage", "success reset password!!");
        req.flash("alertStatus", "success");
        res.redirect("/admin/reset-password/:token");
      } else {
        req.flash("alertMessage", "username tidak di temukan!!");
        req.flash("alertStatus", "danger");
        res.redirect("/admin/reset-password/:token");
      }
    } catch (error) {
      req.flash("alertMessage", `${error}`);
      req.flash("alertStatus", "danger");
      console.log(error);
      res.redirect("/admin/reset-password/:token");
    }
  },

  // view forgot-password
  forgotPassword: (req, res) => {
    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");
    const alert = {
      message: alertMessage,
      status: alertStatus,
    };
    res.render("admin/user/view_forgotPass", {
      title: "Arsip | Forgot Password",
      alert,
      user: req.session.user,
    });
  },

  forgotPasswordAction: async (req, res) => {
    const { email } = req.body;

    try {
      const user = await User.findOne({ email: email });
      if (!user) {
        req.flash("alertMessage", "email tidak terdaftar!!");
        req.flash("alertStatus", "danger");
        res.redirect("/admin/forgot-password");
      }
      const token = await jsonwebtoken.sign(
        {
          iduser: user._id,
        },
        process.env.JSWT_SECRET
      );

      await User.updateOne({ resetPasswordLink: token });

      const templateEmail = {
        from: "Azis",
        to: email,
        subject: "Link Reset PasswordAdmin",
        html: `<p>Silahkan Klik Link di bawah untuk Reset Password Anda</p> <p>http://localhost:3000/admin/reset-password/${token}</p>`,
      };
      kirimEmail(templateEmail);

      req.flash("alertMessage", "silahkan cek email anda!!");
      req.flash("alertStatus", "success");
      res.redirect("/admin/forgot-password");
    } catch (error) {
      req.flash("alertMessage", `${error}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/forgot-password");
    }
  },
};
