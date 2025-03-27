import React, { useState } from 'react';
import { Card, Form, Button, Alert, Spinner, Table } from 'react-bootstrap';
import { metodosNewtonRaphson } from '../../services/api';
import MathKeyboard from '../MathKeyboard';
import FunctionGraph from '../FunctionGraph';
import '../../styles/Metodos.css';
import 'katex/dist/katex.min.css';

const NewtonRaphson = () => {
  const [formData, setFormData] = useState({
    equation: '',
    x0: 0,
    tolerance: 1e-6,
    max_iterations: 100
  });
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('input');

  const toleranceOptions = [
    { value: 1e-1, label: '10⁻¹' },
    { value: 1e-2, label: '10⁻²' },
    { value: 1e-3, label: '10⁻³' },
    { value: 1e-4, label: '10⁻⁴' },
    { value: 1e-5, label: '10⁻⁵' },
    { value: 1e-6, label: '10⁻⁶' },
    { value: 1e-7, label: '10⁻⁷' },
    { value: 1e-8, label: '10⁻⁸' },
    { value: 1e-9, label: '10⁻⁹' },
    { value: 1e-10, label: '10⁻¹⁰' }
  ];

  const handleEquationChange = (expr) => {
    setFormData({ ...formData, equation: expr });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: name === 'tolerance' ? parseFloat(value) : 
              name === 'x0' ? parseFloat(value) : 
              name === 'max_iterations' ? parseInt(value) : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null); // Limpiar resultados previos
    
    try {
      console.log("Enviando datos:", formData);
      const response = await metodosNewtonRaphson.solve(formData);
      console.log("Respuesta recibida:", response);
      
      // Verificar si la respuesta contiene un error
      if (response.detail) {
        // Si hay un mensaje de error en la respuesta
        setError(response.detail);
        setActiveTab('input'); // Mantener al usuario en la pestaña de entrada
      } else {
        // Si la respuesta es exitosa
        setResult(response);
        setActiveTab('results'); // Cambiar a la pestaña de resultados
      }
    } catch (err) {
      console.error("Error completo:", err);
      
      // Manejar diferentes tipos de errores
      if (err.response && err.response.data) {
        // Error del servidor con datos estructurados
        if (err.response.data.detail) {
          setError(err.response.data.detail);
        } else {
          setError(JSON.stringify(err.response.data));
        }
      } else if (err.message) {
        // Error con mensaje (como errores de red)
        setError(err.message);
      } else {
        // Fallback para otros tipos de errores
        setError('Error al procesar la solicitud. Por favor, inténtelo de nuevo.');
      }
      
      // Mantener al usuario en la pestaña de entrada
      setActiveTab('input');
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para formatear números de manera segura
  const safeToFixed = (value, decimals = 10) => {
    if (value === undefined || value === null) return 'N/A';
    return typeof value === 'number' ? value.toFixed(decimals) : 'N/A';
  };

  // Función auxiliar para formatear en notación científica
  const safeToExponential = (value, decimals = 6) => {
    if (value === undefined || value === null) return 'N/A';
    return typeof value === 'number' ? value.toExponential(decimals) : 'N/A';
  };

  return (
    <div className="method-container">
      <h2 className="method-title">Método de Newton-Raphson</h2>
      
      <div className="method-tabs">
        <button 
          className={`tab-button ${activeTab === 'input' ? 'active' : ''}`}
          onClick={() => setActiveTab('input')}
        >
          Entrada
        </button>
        <button 
          className={`tab-button ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => setActiveTab('results')}
          disabled={!result}
        >
          Resultados
        </button>
        <button 
          className={`tab-button ${activeTab === 'graph' ? 'active' : ''}`}
          onClick={() => setActiveTab('graph')}
        >
          Gráfico
        </button>
        <button 
          className={`tab-button ${activeTab === 'theory' ? 'active' : ''}`}
          onClick={() => setActiveTab('theory')}
        >
          Teoría
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'input' && (
          <Card className="input-card">
            <Card.Body>
              {/* Mostrar mensaje de error si existe */}
              {error && (
                <Alert variant="danger" className="mb-4">
                  <Alert.Heading>Error</Alert.Heading>
                  <p>{error}</p>
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label>Ecuación f(x) = 0</Form.Label>
                  <div className="equation-info">
                    <p>Ingrese la ecuación en la forma f(x) = 0. Por ejemplo, para resolver x² - 4 = 0, ingrese x^2 - 4.</p>
                  </div>
                  <MathKeyboard onChange={handleEquationChange} />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Valor inicial (x₀)</Form.Label>
                  <Form.Control
                    type="number"
                    step="any"
                    name="x0"
                    value={formData.x0}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Tolerancia</Form.Label>
                  <Form.Select
                    name="tolerance"
                    value={formData.tolerance}
                    onChange={handleInputChange}
                    required
                  >
                    {toleranceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Máximo de iteraciones</Form.Label>
                  <Form.Control
                    type="number"
                    name="max_iterations"
                    value={formData.max_iterations}
                    onChange={handleInputChange}
                    required
                    min="1"
                    max="1000"
                  />
                </Form.Group>
                
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" /> 
                      Calculando...
                    </>
                  ) : (
                    'Calcular'
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        )}
        
        {activeTab === 'results' && result && (
          <Card className="results-card">
            <Card.Body>
              <h3 className="results-title">Resultados</h3>
              
              <div className="result-summary">
                <div className="result-item">
                  <h4>Raíz encontrada:</h4>
                  <p className="result-value">
                    {result.root !== undefined && result.root !== null 
                      ? safeToFixed(result.root) 
                      : 'No encontrada'}
                  </p>
                </div>
                
                <div className="result-item">
                  <h4>Iteraciones:</h4>
                  <p className="result-value">
                    {result.iterations}
                  </p>
                </div>
                
                <div className="result-item">
                  <h4>Convergencia:</h4>
                  <p className={`result-value ${result.convergence ? 'text-success' : 'text-danger'}`}>
                    {result.convergence ? 'Sí' : 'No'}
                  </p>
                </div>
                
                <div className="result-item">
                  <h4>Error:</h4>
                  <p className="result-value">
                    {result.error !== undefined && result.error !== null 
                      ? safeToExponential(result.error) 
                      : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="result-message">
                <h4>Mensaje:</h4>
                <p>{result.message || 'No hay mensaje disponible'}</p>
              </div>
              
              <h4 className="iterations-title">Tabla de Iteraciones</h4>
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Iteración</th>
                      <th>x<sub>i</sub></th>
                      <th>f(x<sub>i</sub>)</th>
                      <th>f'(x<sub>i</sub>)</th>
                      <th>x<sub>i+1</sub></th>
                      <th>Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.all_iterations && result.all_iterations.map((iter, index) => (
                      <tr key={index}>
                        <td>{iter.iteration}</td>
                        <td>{safeToFixed(iter.x)}</td>
                        <td>{safeToFixed(iter["f(x)"])}</td>
                        <td>{safeToFixed(iter["f'(x)"])}</td>
                        <td>{safeToFixed(iter.next_x)}</td>
                        <td>{safeToExponential(iter.error)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}
        
        {activeTab === 'graph' && (
          <Card className="graph-card">
            <Card.Body>
              <h3 className="graph-title">Gráfico de la Función</h3>
              <FunctionGraph equation={formData.equation} />
              <div className="graph-legend">
                <div className="legend-item">
                  <span className="color-box red"></span>
                  <span>f(x) = {formData.equation || '...'}</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        )}
        
        {activeTab === 'theory' && (
          <Card className="theory-card">
            <Card.Body>
              <h3 className="theory-title">Teoría del Método de Newton-Raphson</h3>
              
              <div className="theory-section">
                <h4>Definición</h4>
                <p>
                  El método de Newton-Raphson es una técnica iterativa para encontrar raíces de ecuaciones no lineales.
                  Utiliza la derivada de la función para aproximar la función por su recta tangente en cada iteración.
                </p>
              </div>
              
              <div className="theory-section">
                <h4>Algoritmo</h4>
                <ol>
                  <li>Elegir un valor inicial x₀ cercano a la raíz</li>
                  <li>Calcular la siguiente aproximación usando la fórmula: x<sub>n+1</sub> = x<sub>n</sub> - f(x<sub>n</sub>)/f'(x<sub>n</sub>)</li>
                  <li>Repetir hasta que |x<sub>n+1</sub> - x<sub>n</sub>| &lt; tolerancia o se alcance el máximo de iteraciones</li>
                </ol>
              </div>
              
              <div className="theory-section">
                <h4>Convergencia</h4>
                <p>
                  El método de Newton-Raphson converge cuadráticamente cuando:
                </p>
                <ul>
                  <li>La función f(x) es continuamente diferenciable</li>
                  <li>f'(x) ≠ 0 en la vecindad de la raíz</li>
                  <li>El valor inicial x₀ está suficientemente cerca de la raíz</li>
                </ul>
                <p>
                  La convergencia cuadrática significa que el número de dígitos correctos aproximadamente se duplica en cada iteración.
                </p>
              </div>
              
              <div className="theory-section">
                <h4>Ventajas y Desventajas</h4>
                <p><strong>Ventajas:</strong></p>
                <ul>
                  <li>Convergencia rápida (cuadrática) cuando las condiciones son favorables</li>
                  <li>Requiere pocas iteraciones para alcanzar una buena aproximación</li>
                </ul>
                <p><strong>Desventajas:</strong></p>
                <ul>
                  <li>Requiere el cálculo de la derivada de la función</li>
                  <li>Puede diverger si el valor inicial no es adecuado</li>
                  <li>Problemas cuando f'(x) se acerca a cero (pendiente casi horizontal)</li>
                </ul>
              </div>
              
              <div className="theory-section">
                <h4>Ejemplo</h4>
                <p>
                  Para resolver x² - 4 = 0 usando Newton-Raphson:
                </p>
                <ul>
                  <li>f(x) = x² - 4</li>
                  <li>f'(x) = 2x</li>
                  <li>Fórmula de iteración: x<sub>n+1</sub> = x<sub>n</sub> - (x<sub>n</sub>² - 4)/(2x<sub>n</sub>)</li>
                  <li>Partiendo de x₀ = 3, obtenemos x₁ = 3 - (9-4)/(2*3) = 3 - 5/6 = 2.17</li>
                  <li>Continuando, x₂ = 2.17 - (4.7-4)/(2*2.17) = 2.17 - 0.7/4.34 = 2.01</li>
                  <li>Rápidamente converge a x = 2, que es la raíz exacta</li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NewtonRaphson;