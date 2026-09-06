import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Copy, Edit3, ImagePlus, Plus, Save, ShieldCheck, Trash2, X } from "lucide-react";
import { api } from "../api/api";

const SETTINGS = {
  title: "APP_TITLE",
  version: "APP_VERSION",
  logo: "APP_LOGO",
  schoolCode: "KODE_SEKOLAH",
  supabaseUrl: "SUPABASE_PROJECT_URL",
  supabaseKey: "SUPABASE_PUBLISHABLE_KEY",
};

const SAMPLE_SCHOOLS = [
  { id: 9001, kode_sekolah: "BALANGAN-01", nama_sekolah: "SMA Negeri 1 Paringin", alamat: "Paringin, Balangan", logo_url: "", supabase_url: "", supabase_key: "", aktif: true },
  { id: 9002, kode_sekolah: "BALANGAN-02", nama_sekolah: "SMA Negeri 2 Batumandi", alamat: "Batumandi, Balangan", logo_url: "", supabase_url: "", supabase_key: "", aktif: true },
  { id: 9003, kode_sekolah: "BALANGAN-03", nama_sekolah: "SMK Negeri 1 Juai", alamat: "Juai, Balangan", logo_url: "", supabase_url: "", supabase_key: "", aktif: true },
];

const emptySchool = { kode_sekolah: "", nama_sekolah: "", alamat: "", logo_url: "", supabase_url: "", supabase_key: "", aktif: true };

const SuperAdminPanel = ({ onBack }) => {
  const [form, setForm] = useState({ title: "TADBIRA", version: "Version 1.0", logo: "", schoolCode: "", supabaseUrl: "", supabaseKey: "" });
  const [schools, setSchools] = useState([]);
  const [schoolForm, setSchoolForm] = useState(emptySchool);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const settings = await api.read("Settings");
    let schoolRows = [];
    try {
      schoolRows = await api.read("Sekolah");
    } catch (error) {
      if (!String(error?.message || "").toLowerCase().includes("sekolah")) throw error;
      setStatus("Tabel sekolah belum tersedia. Jalankan migrasi sekolah untuk menyimpan data.");
    }
    const values = Object.fromEntries((settings || []).map((row) => [String(row.kunci), row.nilai]));
    setForm((prev) => ({ ...prev, title: values[SETTINGS.title] || prev.title, version: values[SETTINGS.version] || prev.version, logo: values[SETTINGS.logo] || "", schoolCode: values[SETTINGS.schoolCode] || "", supabaseUrl: values[SETTINGS.supabaseUrl] || "", supabaseKey: values[SETTINGS.supabaseKey] || "" }));
    setSchools(schoolRows || []);
  };

  useEffect(() => { load().catch((error) => setStatus(error.message || "Konfigurasi gagal dimuat.")); }, []);
  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const nextId = (rows) => Math.max(0, ...(rows || []).map((item) => Number(item.id) || 0)) + 1;

  const saveSettings = async (event) => {
    event.preventDefault(); setSaving(true); setStatus("");
    try {
      const rows = await api.read("Settings"); let id = nextId(rows);
      const values = { [SETTINGS.title]: form.title.trim(), [SETTINGS.version]: form.version.trim(), [SETTINGS.logo]: form.logo.trim(), [SETTINGS.schoolCode]: form.schoolCode.trim(), [SETTINGS.supabaseUrl]: form.supabaseUrl.trim(), [SETTINGS.supabaseKey]: form.supabaseKey.trim() };
      for (const [key, value] of Object.entries(values)) {
        const row = rows.find((item) => String(item.kunci) === key);
        if (row) await api.update("Settings", row.id, { nilai: value });
        else await api.create("Settings", { id: id++, kunci: key, nilai: value });
      }
      localStorage.setItem("tadbira_branding", JSON.stringify({ title: values[SETTINGS.title], version: values[SETTINGS.version], logo: values[SETTINGS.logo] }));
      window.dispatchEvent(new Event("tadbira-branding-updated")); setStatus("Branding berhasil disimpan.");
    } catch (error) { setStatus(error.message || "Branding gagal disimpan."); } finally { setSaving(false); }
  };

  const uploadImage = (event, target, setter) => {
    const file = event.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) { setStatus("Pilih gambar maksimal 2 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => setter(target, String(reader.result));
    reader.onerror = () => setStatus("Gambar tidak dapat dibaca.");
    reader.readAsDataURL(file); event.target.value = "";
  };

  const schoolRows = useMemo(() => schools.length ? schools : SAMPLE_SCHOOLS, [schools]);
  const saveSchool = async (event) => {
    event.preventDefault(); setSaving(true); setStatus("");
    try {
      const payload = { ...schoolForm, kode_sekolah: schoolForm.kode_sekolah.trim().toUpperCase(), nama_sekolah: schoolForm.nama_sekolah.trim() };
      if (editingId) await api.update("Sekolah", editingId, payload);
      else await api.create("Sekolah", { id: nextId(schools), ...payload });
      await load(); setSchoolForm(emptySchool); setEditingId(null); setStatus("Data sekolah berhasil disimpan.");
    } catch (error) { setStatus(error.message || "Data sekolah gagal disimpan."); } finally { setSaving(false); }
  };
  const removeSchool = async (school) => {
    if (!school.id || school.id >= 9000) { setSchools((rows) => rows.filter((row) => row.id !== school.id)); return; }
    setSaving(true);
    try { await api.delete("Sekolah", school.id); await load(); setStatus("Data sekolah dihapus."); }
    catch (error) { setStatus(error.message || "Data sekolah gagal dihapus."); } finally { setSaving(false); }
  };
  const copySchool = (school) => { navigator.clipboard?.writeText(`${school.kode_sekolah} - ${school.nama_sekolah}`); setStatus("Identitas sekolah disalin."); };
  const editSchool = (school) => { setEditingId(school.id); setSchoolForm({ ...emptySchool, ...school }); };

  return <div className="min-h-full space-y-5 rounded-3xl bg-white p-4 shadow-sm sm:p-6 lg:p-8">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
      <div className="flex items-center gap-3"><button type="button" onClick={onBack} className="rounded-xl border border-slate-200 p-2 text-slate-600"><ArrowLeft size={18} /></button><div><h1 className="flex items-center gap-2 text-lg font-black text-slate-800 sm:text-xl"><ShieldCheck className="text-emerald-600" /> Pusat Kontrol Super Admin</h1><p className="text-xs text-slate-500">Responsif desktop, tablet, dan HP. Data dimuat saat panel dibuka.</p></div></div>
    </header>
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h2 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-700">Branding aplikasi</h2>
      <form onSubmit={saveSettings} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-xs font-bold text-slate-600">Nama aplikasi<input value={form.title} onChange={(e) => update("title", e.target.value)} className="sa-input" /></label>
        <label className="text-xs font-bold text-slate-600">Versi<input value={form.version} onChange={(e) => update("version", e.target.value)} className="sa-input" /></label>
        <label className="text-xs font-bold text-slate-600 sm:col-span-2 lg:col-span-1">Logo URL / upload<input value={form.logo} onChange={(e) => update("logo", e.target.value)} className="sa-input" placeholder="https://..." /><span className="mt-1 inline-flex cursor-pointer items-center gap-1 text-[11px] text-emerald-700"><ImagePlus size={13} /> <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage(e, "logo", update)} /> Pilih gambar sampel</span>{form.logo && <img src={form.logo} alt="Preview logo aplikasi" className="mt-2 h-12 w-12 rounded-xl border border-slate-200 bg-white object-contain p-1" />}</label>
        <label className="text-xs font-bold text-slate-600">Kode sekolah aktif<input value={form.schoolCode} onChange={(e) => update("schoolCode", e.target.value)} className="sa-input" /></label>
        <label className="text-xs font-bold text-slate-600">Supabase URL alternatif<input value={form.supabaseUrl} onChange={(e) => update("supabaseUrl", e.target.value)} className="sa-input" /></label>
        <label className="text-xs font-bold text-slate-600">Publishable key<input value={form.supabaseKey} onChange={(e) => update("supabaseKey", e.target.value)} className="sa-input" /></label>
        <p className="text-[11px] text-amber-700 sm:col-span-2 lg:col-span-3">Password Supabase tidak disimpan. Gunakan environment/server secret.</p>
        <button disabled={saving} className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white sm:col-span-2 lg:col-span-3"><Save size={16} /> Simpan Branding</button>
      </form>
    </section>
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-base font-black text-slate-800 sm:text-lg">Manajemen Sekolah</h2><p className="text-xs text-slate-500">{schoolRows.length} sekolah terdaftar · siap dikembangkan hingga 21 sekolah.</p></div><button type="button" onClick={() => { setSchoolForm(emptySchool); setEditingId(null); }} className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-black text-white"><Plus size={15} /> Tambah sekolah</button></div>
      <form onSubmit={saveSchool} className="grid gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 sm:grid-cols-2 lg:grid-cols-4">
        {["kode_sekolah", "nama_sekolah", "alamat", "supabase_url", "supabase_key"].map((key) => <label key={key} className="text-xs font-bold text-slate-600">{key.replace("_", " ")}<input value={schoolForm[key]} onChange={(e) => setSchoolForm((prev) => ({ ...prev, [key]: e.target.value }))} className="sa-input" /></label>)}
        <label className="flex items-center gap-2 self-end text-xs font-bold text-slate-600"><input type="checkbox" checked={schoolForm.aktif} onChange={(e) => setSchoolForm((prev) => ({ ...prev, aktif: e.target.checked }))} /> Aktif</label>
        <div className="flex items-center gap-2 self-end lg:col-span-2"><button disabled={saving} className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-black text-white"><Save size={14} /> {editingId ? "Perbarui" : "Simpan"}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setSchoolForm(emptySchool); }} className="rounded-xl bg-slate-200 p-2.5 text-slate-600"><X size={15} /></button>}</div>
      </form>
      <div className="overflow-x-auto rounded-2xl border border-slate-200"><table className="min-w-[760px] w-full text-left text-xs"><thead className="bg-slate-100 text-[10px] uppercase tracking-wide text-slate-500"><tr><th className="p-3">Kode</th><th className="p-3">Nama sekolah</th><th className="p-3">Alamat</th><th className="p-3">Status</th><th className="p-3 text-right">Aksi</th></tr></thead><tbody>{schoolRows.map((school) => <tr key={school.id || school.kode_sekolah} className="border-t border-slate-100"><td className="p-3 font-black text-indigo-700">{school.kode_sekolah}</td><td className="p-3 font-bold text-slate-700">{school.nama_sekolah}</td><td className="p-3 text-slate-500">{school.alamat || "-"}</td><td className="p-3"><span className={`rounded-full px-2 py-1 text-[10px] font-black ${school.aktif === false ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>{school.aktif === false ? "Nonaktif" : "Aktif"}</span></td><td className="p-3"><div className="flex justify-end gap-1"><button type="button" aria-label="Salin sekolah" onClick={() => copySchool(school)} className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50"><Copy size={14} /></button><button type="button" aria-label="Edit sekolah" onClick={() => editSchool(school)} className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50"><Edit3 size={14} /></button><button type="button" aria-label="Hapus sekolah" onClick={() => removeSchool(school)} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={14} /></button></div></td></tr>)}</tbody></table></div>
    </section>
    {status && <p className="rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{status}</p>}
  </div>;
};

export default SuperAdminPanel;
