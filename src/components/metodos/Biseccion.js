import React, { useState } from 'react';
import { Card, Form, Button, Alert, Spinner, Table } from 'react-bootstrap';
import { metodosBiseccion } from '../../services/api';
import MathKeyboard from '../MathKeyboard';
import FunctionGraph from '../FunctionGraph';
import '../../styles/Metodos.css';
import 'katex/dist/katex.min.css';

const Biseccion = () => {
  const [formData, setFormData] = useState({
    equation: '',
    a: 0,
    b: 1,
    tol: 1e-6,
    max_iter: 100
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
    // Asegurarse de que 'e' se interprete como la constante de Euler
    let processedExpr = expr;
    
    // Si la expresión contiene 'e' como variable aislada, reemplazarla por math.e o exp(1)
    // dependiendo del contexto
    if (/\be\b/.test(processedExpr)) {
      console.log("Detectada constante de Euler en la expresión");
      // No necesitamos hacer nada aquí, ya que la función convertLatexToEvaluable
      // en MathKeyboard.js se encargará de la conversión
    }
    
    setFormData({ ...formData, equation: processedExpr });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let parsedValue = value;
    
    // Convertir a número para campos numéricos
    if (['a', 'b', 'tol', 'max_iter'].includes(name)) {
      parsedValue = name === 'max_iter' ? parseInt(value, 10) : parseFloat(value);
    }
    
    setFormData({ ...formData, [name]: parsedValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null); // Limpiar resultados previos
    
    try {
      console.log("Enviando datos:", formData);
      const response = await metodosBiseccion.solve(formData);
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
      <h2 className="method-title">Método de Bisección</h2>
      
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
                
                <div className="form-row">
                  <Form.Group className="mb-3 half-width">
                    <Form.Label>Límite inferior (a)</Form.Label>
                    <Form.Control
                      type="number"
                      step="any"
                      name="a"
                      value={formData.a}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3 half-width">
                    <Form.Label>Límite superior (b)</Form.Label>
                    <Form.Control
                      type="number"
                      step="any"
                      name="b"
                      value={formData.b}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </div>
                
                <Form.Group className="mb-3">
                  <Form.Label>Tolerancia</Form.Label>
                  <Form.Select
                    name="tol"
                    value={formData.tol}
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
                    name="max_iter"
                    value={formData.max_iter}
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
                    {result.raiz !== undefined && result.raiz !== null 
                      ? safeToFixed(result.raiz) 
                      : 'No encontrada'}
                  </p>
                </div>
                
                <div className="result-item">
                  <h4>Iteraciones:</h4>
                  <p className="result-value">
                    {result.iteraciones || 0}
                  </p>
                </div>
              </div>
              
              <div className="result-message">
                <h4>Mensaje:</h4>
                <p>{result.mensaje || 'No hay mensaje disponible'}</p>
              </div>
              
              <h4 className="iterations-title">Tabla de Iteraciones</h4>
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Iteración</th>
                      <th>a</th>
                      <th>b</th>
                      <th>Punto Medio</th>
                      <th>Error (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.pasos && result.pasos.map((paso, index) => (
                      <tr key={index}>
                        <td>{paso.iteracion}</td>
                        <td>{safeToFixed(paso.punto_a, 6)}</td>
                        <td>{safeToFixed(paso.punto_b, 6)}</td>
                        <td>{safeToFixed(paso.punto_medio, 6)}</td>
                        <td>{safeToExponential(paso.error_porcentual)}</td>
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
              <h3 className="theory-title">Teoría del Método de Bisección</h3>
              
              <div className="theory-section">
                <h4>Definición</h4>
                <p>
                  El método de bisección es una técnica numérica para encontrar raíces de una función continua f(x) 
                  en un intervalo [a, b] donde f(a) y f(b) tienen signos opuestos. Se basa en el teorema del valor 
                  intermedio, que garantiza la existencia de al menos una raíz en dicho intervalo.
                </p>
              </div>
              
              <div className="theory-section">
                <h4>Algoritmo</h4>
                <ol>
                  <li>Seleccionar un intervalo inicial [a, b] donde f(a) × f(b) &lt; 0</li>
                  <li>Calcular el punto medio c = (a + b) / 2</li>
                  <li>Evaluar f(c)</li>
                  <li>Si f(c) = 0 o |b - a| &lt; tolerancia, c es la raíz aproximada</li>
                  <li>Si f(c) × f(a) &lt; 0, la raíz está en [a, c], entonces b = c</li>
                  <li>Si f(c) × f(b) &lt; 0, la raíz está en [c, b], entonces a = c</li>
                  <li>Repetir desde el paso 2 hasta alcanzar la tolerancia o el máximo de iteraciones</li>
                </ol>
              </div>
              
              <div className="theory-section">
                <h4>Convergencia</h4>
                <p>
                  El método de bisección siempre converge para funciones continuas cuando f(a) y f(b) tienen signos opuestos. 
                  En cada iteración, el intervalo se reduce a la mitad, por lo que el error se reduce en un factor de 2.
                </p>
              </div>
              
              <div className="theory-section">
                <h4>Ventajas y Desventajas</h4>
                <p><strong>Ventajas:</strong></p>
                <ul>
                  <li>Simple de implementar y entender</li>
                  <li>Garantiza convergencia para funciones continuas</li>
                  <li>Robusto y confiable</li>
                </ul>
                <p><strong>Desventajas:</strong></p>
                <ul>
                  <li>Convergencia relativamente lenta</li>
                  <li>Requiere que la función cambie de signo en el intervalo</li>
                  <li>No aprovecha información sobre la pendiente de la función</li>
                </ul>
              </div>
              
              <div className="theory-section">
                <h4>Ejemplo</h4>
                <p>
                  Para encontrar una raíz de f(x) = x² - 4 en el intervalo [1, 3]:
                </p>
                <ul>
                  <li>f(1) = 1² - 4 = -3 (negativo)</li>
                  <li>f(3) = 3² - 4 = 5 (positivo)</li>
                  <li>Como f(1) y f(3) tienen signos opuestos, hay una raíz en [1, 3]</li>
                  <li>Punto medio: c = (1 + 3) / 2 = 2</li>
                  <li>f(2) = 2² - 4 = 0</li>
                  <li>Como f(2) = 0, la raíz exacta es x = 2</li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Biseccion;