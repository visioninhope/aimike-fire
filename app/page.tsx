// app/products/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Form, Table } from 'react-bootstrap';

export default function ProductsPage() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const response = await fetch('/api/products');
    const data = await response.json();
    setProducts(data);
  };

  const createProduct = async (data) => {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const newProduct = await response.json();
    setProducts([...products, newProduct]);
    reset();
  };

  const updateProduct = async (data) => {
    const response = await fetch(`/api/products`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const updatedProduct = await response.json();
    setProducts(products.map((prod) => (prod.id === data.id ? updatedProduct : prod)));
    setEditingProduct(null);
  };

  const deleteProduct = async (id) => {
    await fetch(`/api/products`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setProducts(products.filter((prod) => prod.id !== id));
  };

  return (
    <div className="container mt-5">
      <h1>Product Management</h1>
      <Form onSubmit={handleSubmit(createProduct)} className="mb-4">
        <Form.Group controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            {...register('name', { required: 'Name is required' })}
          />
          {errors.name && <span className="text-danger">{errors.name.message}</span>}
        </Form.Group>
        <Form.Group controlId="description">
          <Form.Label>Description</Form.Label>
          <Form.Control
            type="text"
            {...register('description', { required: 'Description is required' })}
          />
          {errors.description && <span className="text-danger">{errors.description.message}</span>}
        </Form.Group>
        <Form.Group controlId="price">
          <Form.Label>Price</Form.Label>
          <Form.Control
            type="number"
            {...register('price', { required: 'Price is required' })}
          />
          {errors.price && <span className="text-danger">{errors.price.message}</span>}
        </Form.Group>
        <Form.Group controlId="stock">
          <Form.Label>Stock</Form.Label>
          <Form.Control
            type="number"
            {...register('stock', { required: 'Stock is required' })}
          />
          {errors.stock && <span className="text-danger">{errors.stock.message}</span>}
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3">Add Product</Button>
      </Form>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.description}</td>
              <td>{product.price}</td>
              <td>{product.stock}</td>
              <td>
                <Button variant="warning" onClick={() => setEditingProduct(product)}>Edit</Button>{' '}
                <Button variant="danger" onClick={() => deleteProduct(product.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {editingProduct && (
        <Form onSubmit={handleSubmit(updateProduct)} className="mt-4">
          <input type="hidden" {...register('id')} defaultValue={editingProduct.id} />
          <Form.Group controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              {...register('name', { required: 'Name is required' })}
              defaultValue={editingProduct.name}
            />
            {errors.name && <span className="text-danger">{errors.name.message}</span>}
          </Form.Group>
          <Form.Group controlId="description">
            <Form.Label>Description</Form.Label>
            <Form.Control
              type="text"
              {...register('description', { required: 'Description is required' })}
              defaultValue={editingProduct.description}
            />
            {errors.description && <span className="text-danger">{errors.description.message}</span>}
          </Form.Group>
          <Form.Group controlId="price">
            <Form.Label>Price</Form.Label>
            <Form.Control
              type="number"
              {...register('price', { required: 'Price is required' })}
              defaultValue={editingProduct.price}
            />
            {errors.price && <span className="text-danger">{errors.price.message}</span>}
          </Form.Group>
          <Form.Group controlId="stock">
            <Form.Label>Stock</Form.Label>
            <Form.Control
              type="number"
              {...register('stock', { required: 'Stock is required' })}
              defaultValue={editingProduct.stock}
            />
            {errors.stock && <span className="text-danger">{errors.stock.message}</span>}
          </Form.Group>
          <Button variant="primary" type="submit" className="mt-3">Update Product</Button>
        </Form>
      )}
    </div>
  );
}
