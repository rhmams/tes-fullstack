from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

products = [
    {"id": 1, "name": "baju", "price": 150000, "stock": 8},
    {"id": 2, "name": "sepatu", "price": 230000, "stock": 17},
    {"id": 3, "name": "handuk", "price": 50000, "stock": 2},
    {"id": 4, "name": "lampu", "price": 30000, "stock": 6},
]
next_id = 5


def find_product(product_id):
    return next((p for p in products if p["id"] == product_id), None)

def validate_product(body, partial=False):
    """Kembalikan list pesan error. List kosong berarti data valid.
    partial=True dipakai untuk PUT (hanya field yang dikirim yang dicek)."""
    errors = []

    if not partial or "name" in body:
        name = body.get("name")
        if not isinstance(name, str) or not name.strip():
            errors.append("name wajib diisi")

    for field in ("price", "stock"):
        if not partial or field in body:
            value = body.get(field)
            is_number = isinstance(value, (int, float)) and not isinstance(value, bool)
            if not is_number or value <= 0:
                errors.append(f"{field} harus berupa angka positif")

    return errors

@app.get("/api/products")
def get_products():
    return jsonify({"data": products})

@app.get("/api/products/<int:product_id>")
def get_product(product_id):
    product = find_product(product_id)
    if product is None:
        return jsonify({"message": "Produk tidak ditemukan"}), 404
    return jsonify({"data": product})

@app.post("/api/products")
def create_product():
    global next_id
    body = request.get_json(silent=True) or {}

    errors = validate_product(body)
    if errors:
        return jsonify({"message": "; ".join(errors)}), 400

    product = {
        "id": next_id,
        "name": body["name"].strip(),
        "price": body["price"],
        "stock": body["stock"],
    }
    next_id += 1
    products.append(product)
    return jsonify({"message": "Produk dibuat", "data": product}), 201


@app.put("/api/products/<int:product_id>")
def update_product(product_id):
    product = find_product(product_id)
    if product is None:
        return jsonify({"message": "Produk tidak ditemukan"}), 404

    body = request.get_json(silent=True) or {}

    errors = validate_product(body, partial=True)
    if errors:
        return jsonify({"message": "; ".join(errors)}), 400

    if "name" in body:
        product["name"] = body["name"].strip()
    if "price" in body:
        product["price"] = body["price"]
    if "stock" in body:
        product["stock"] = body["stock"]

    return jsonify({"message": "Produk berhasil diperbarui", "data": product})

@app.delete("/api/products/<int:product_id>")
def delete_product(product_id):
    product = find_product(product_id)
    if product is None:
        return jsonify({"message": "Produk tidak ditemukan"}), 404

    products.remove(product)
    return "", 204


if __name__ == "__main__":
    app.run(port=3000, debug=True)