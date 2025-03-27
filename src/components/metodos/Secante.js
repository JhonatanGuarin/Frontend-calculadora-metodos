import React, { useState } from 'react';
import { Card, Form, Button, Alert, Spinner, Table } from 'react-bootstrap';
import { metodosSecante } from '../../services/api';
import MathKeyboard from '../MathKeyboard';
import FunctionGraph from '../FunctionGraph';
import '../../styles/Metodos.css';
import 'katex/dist/katex.min.css';

const Secante = () => {
  const [formData, setFormData] = useState({
    equation: '',
    x0: 0,
    x1: 1,
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
              ['x0', 'x1'].includes(name) ? parseFloat(value) : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      console.log("Enviando datos:", formData);
      const response = await metodosSecante.solve(formData);
      console.log("Respuesta recibida:", response);
      setResult(response);
      setActiveTab('results');
    } catch (err) {
      console.error("Error completo:", err);
      setError(
        err.response?.data?.detail || 
        err.message || 
        'Error al procesar la solicitud'
      );
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
      <h2 className="method-title">Método de la Secante</h2>
      
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
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label>Ecuación f(x) = 0</Form.Label>
                  <div className="equation-info">
                    <p>Ingrese la ecuación en la forma f(x) = 0. Por ejemplo, para resolver x² - 4 = 0, ingrese x^2 - 4.</p>
                  </div>
                  <MathKeyboard onChange={handleEquationChange} />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Primera aproximación (x₀)</Form.Label>
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
                  <Form.Label>Segunda aproximación (x₁)</Form.Label>
                  <Form.Control
                    type="number"
                    step="any"
                    name="x1"
                    value={formData.x1}
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
                      <Spinner animation="border" size="sm" /> 
                      Calculando...
                    </>
                  ) : (
                    'Calcular'
                  )}
                </Button>
              </Form>
              
              {error && (
                <Alert variant="danger" className="mt-3">
                  {error}
                </Alert>
              )}
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
                    {result.iterations || 0}
                  </p>
                </div>
                
                <div className="result-item">
                  <h4>Convergencia:</h4>
                  <p className={`result-value ${result.converged ? 'text-success' : 'text-danger'}`}>
                    {result.converged ? 'Sí' : 'No'}
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
                      <th>x<sub>prev</sub></th>
                      <th>x<sub>curr</sub></th>
                      <th>x<sub>next</sub></th>
                      <th>f(x<sub>prev</sub>)</th>
                      <th>f(x<sub>curr</sub>)</th>
                      <th>Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.all_iterations && result.all_iterations.map((iter, index) => (
                      <tr key={index}>
                        <td>{iter.iteration}</td>
                        <td>{safeToFixed(iter.x_prev)}</td>
                        <td>{safeToFixed(iter.x_curr)}</td>
                        <td>{safeToFixed(iter.x_next)}</td>
                        <td>{safeToFixed(iter.f_prev)}</td>
                        <td>{safeToFixed(iter.f_curr)}</td>
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
              <h3 className="theory-title">Teoría del Método de la Secante</h3>
              
              <div className="theory-section">
                <h4>Definición</h4>
                <p>
                  El método de la secante es una técnica iterativa para encontrar raíces de ecuaciones que no requiere 
                  calcular derivadas. Es una variación del método de Newton-Raphson donde la derivada se aproxima 
                  mediante una diferencia finita.
                </p>
              </div>
              
              <div className="theory-section">
                <h4>Algoritmo</h4>
                <ol>
                  <li>Elegir dos valores iniciales x₀ y x₁</li>
                  <li>Calcular la siguiente aproximación usando la fórmula:
                    <div className="formula">
                      x<sub>n+1</sub> = x<sub>n</sub> - f(x<sub>n</sub>) · (x<sub>n</sub> - x<sub>n-1</sub>) / (f(x<sub>n</sub>) - f(x<sub>n-1</sub>))
                    </div>
                  </li>
                  <li>Continuar hasta que |x<sub>n+1</sub> - x<sub>n</sub>| &lt; tolerancia o se alcance el máximo de iteraciones</li>
                </ol>
              </div>
              
              <div className="theory-section">
                <h4>Convergencia</h4>
                <p>
                  El método de la secante tiene un orden de convergencia de aproximadamente 1.618 (número áureo), 
                  lo que lo hace más rápido que el método de bisección (orden 1) pero más lento que Newton-Raphson (orden 2).
                </p>
              </div>
              
              <div className="theory-section">
                <h4>Ventajas</h4>
                <ul>
                  <li>No requiere calcular derivadas</li>
                  <li>Converge más rápido que el método de bisección</li>
                  <li>Requiere solo evaluaciones de la función</li>
                </ul>
              </div>
              
              <div className="theory-section">
                <h4>Desventajas</h4>
                <ul>
                  <li>Puede diverger si los valores iniciales no son adecuados</li>
                  <li>Puede fallar si f(x<sub>n</sub>) - f(x<sub>n-1</sub>) es cercano a cero</li>
                  <li>No garantiza convergencia como el método de bisección</li>
                </ul>
              </div>
              
              <div className="theory-section">
                <h4>Ejemplo</h4>
                <p>
                  Para resolver x² - 4 = 0 con x₀ = 1 y x₁ = 3:
                </p>
                <ul>
                  <li>f(x₀) = f(1) = 1² - 4 = -3</li>
                  <li>f(x₁) = f(3) = 3² - 4 = 5</li>
                  <li>x₂ = 3 - 5·(3-1)/(5-(-3)) = 3 - 10/8 = 3 - 1.25 = 1.75</li>
                  <li>Continuando el proceso, converge a x = 2</li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Secante;