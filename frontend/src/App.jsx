import { useState, useEffect } from "react";

const API_URL = "http://localhost:3000/api/products";
const emptyForm = { name: "", price: "", stock: "" };

// validasi form, mengembalikan object error per field
function validate(form) {
  const errors = {};

  if (!form.name.trim()) {
    errors.name = "Nama wajib diisi";
  }

  const price = Number(form.price);
  if (form.price === "" || Number.isNaN(price) || price <= 0) {
    errors.price = "Harga harus berupa angka lebih dari 0";
  }

  const stock = Number(form.stock);
  if (form.stock === "" || Number.isNaN(stock) || stock <= 0) {
    errors.stock = "Stok harus berupa angka lebih dari 0";
  }

  return errors;
}

const errorStyle = { color: "red", fontSize: 13, margin: "4px 0 0" };

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = mode tambah

  // ambil semua produk
  const fetchProducts = () => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((json) => {
        setProducts(json.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // update state form, sekaligus hapus pesan error field itu
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: undefined });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setErrors({});
    setServerError("");
    setEditingId(null);
  };

  // isi form dengan data produk yang mau diedit
  const handleEdit = (p) => {
    setEditingId(p.id);
    setForm({ name: p.name, price: String(p.price), stock: String(p.stock) });
    setErrors({});
    setServerError("");
  };

  // kirim ke API: POST kalau tambah, PUT kalau edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const isEdit = editingId !== null;
    const url = isEdit ? `${API_URL}/${editingId}` : API_URL;

    setSaving(true);
    try {
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          price: Number(form.price),
          stock: Number(form.stock),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setServerError(json.message || "Gagal menyimpan produk");
      } else {
        resetForm();
        fetchProducts();
      }
    } catch (err) {
      setServerError("Tidak bisa terhubung ke server");
    } finally {
      setSaving(false);
    }
  };

  // hapus produk
  const handleDelete = async (p) => {
    if (!window.confirm(`Hapus produk "${p.name}"?`)) return;

    try {
      const res = await fetch(`${API_URL}/${p.id}`, { method: "DELETE" });

      if (!res.ok) {
        const json = await res.json();
        setServerError(json.message || "Gagal menghapus produk");
        return;
      }

      // kalau produk yang sedang diedit dihapus, batalkan mode edit
      if (editingId === p.id) resetForm();
      fetchProducts();
    } catch (err) {
      setServerError("Tidak bisa terhubung ke server");
    }
  };

  if (loading) return <p>Loading..</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Daftar Produk</h1>

      <h2>{editingId !== null ? `Edit Produk (ID ${editingId})` : "Tambah Produk"}</h2>
      <form onSubmit={handleSubmit} noValidate style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 8 }}>
          <input
            type="text"
            name="name"
            placeholder="Nama produk"
            value={form.name}
            onChange={handleChange}
          />
          {errors.name && <p style={errorStyle}>{errors.name}</p>}
        </div>
        <div style={{ marginBottom: 8 }}>
          <input
            type="number"
            name="price"
            placeholder="Harga"
            value={form.price}
            onChange={handleChange}
          />
          {errors.price && <p style={errorStyle}>{errors.price}</p>}
        </div>
        <div style={{ marginBottom: 8 }}>
          <input
            type="number"
            name="stock"
            placeholder="Stok"
            value={form.stock}
            onChange={handleChange}
          />
          {errors.stock && <p style={errorStyle}>{errors.stock}</p>}
        </div>

        {serverError && <p style={{ color: "red" }}>{serverError}</p>}

        <button type="submit" disabled={saving}>
          {saving
            ? "Menyimpan..."
            : editingId !== null
            ? "Simpan Perubahan"
            : "+ Tambah Produk"}
        </button>
        {editingId !== null && (
          <button type="button" onClick={resetForm} style={{ marginLeft: 8 }}>
            Batal
          </button>
        )}
      </form>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama</th>
            <th>Harga</th>
            <th>Stok</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>Rp {p.price.toLocaleString("id-ID")}</td>
              <td>{p.stock}</td>
              <td>
                <button onClick={() => handleEdit(p)}>Edit</button>
                <button onClick={() => handleDelete(p)} style={{ marginLeft: 8 }}>
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;