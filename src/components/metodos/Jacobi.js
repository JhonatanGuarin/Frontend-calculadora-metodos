import React, { useState } from 'react';
import { Card, Form, Button, Alert, Spinner, Table } from 'react-bootstrap';
import { metodosJacobi } from '../../services/api';
import '../../styles/Metodos.css';
import 'katex/dist/katex.min.css';

const Jacobi = () => {
  const [formData, setFormData] = useState({
    A: [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ],
    b: [0, 0, 0],
    initial_guess: [0, 0, 0],
    tolerance: 1e-6,
    max_iterations: 100
  });
  
  const [matrixSize, setMatrixSize] = useState(3);
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

  // Manejar cambio en el tamaño de la matriz
  const handleMatrixSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setMatrixSize(newSize);
    
    // Crear nueva matriz A y vectores b e initial_guess con el nuevo tamaño
    const newA = Array(newSize).fill().map(() => Array(newSize).fill(0));
    const newB = Array(newSize).fill(0);
    const newInitialGuess = Array(newSize).fill(0);
    
    setFormData({
      ...formData,
      A: newA,
      b: newB,
      initial_guess: newInitialGuess
    });
  };

  // Manejar cambios en la matriz A
  const handleMatrixAChange = (rowIndex, colIndex, value) => {
    const newA = [...formData.A];
    newA[rowIndex][colIndex] = parseFloat(value) || 0;
    setFormData({ ...formData, A: newA });
  };

  // Manejar cambios en el vector b
  const handleVectorBChange = (index, value) => {
    const newB = [...formData.b];
    newB[index] = parseFloat(value) || 0;
    setFormData({ ...formData, b: newB });
  };

  // Manejar cambios en el vector de aproximación inicial
  const handleInitialGuessChange = (index, value) => {
    const newInitialGuess = [...formData.initial_guess];
    newInitialGuess[index] = parseFloat(value) || 0;
    setFormData({ ...formData, initial_guess: newInitialGuess });
  };

  // Manejar cambios en otros campos del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: name === 'tolerance' ? parseFloat(value) : 
              name === 'max_iterations' ? parseInt(value) : value 
    });
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      console.log("Enviando datos:", formData);
      const response = await metodosJacobi.solve(formData);
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

  // Función para cargar ejemplos predefinidos
  const loadExample = (exampleNumber) => {
    if (exampleNumber === 1) {
      // Ejemplo 1: Sistema diagonalmente dominante 3x3
      setMatrixSize(3);
      setFormData({
        A: [
          [10, 2, 1],
          [2, 10, 1],
          [1, 1, 5]
        ],
        b: [13, 13, 7],
        initial_guess: [0, 0, 0],
        tolerance: 1e-6,
        max_iterations: 100
      });
    } else if (exampleNumber === 2) {
      // Ejemplo 2: Sistema 4x4
      setMatrixSize(4);
      setFormData({
        A: [
          [10, -1, 0, 0],
          [-1, 11, -1, 0],
          [0, -1, 12, -1],
          [0, 0, -1, 13]
        ],
        b: [9, 9, 10, 12],
        initial_guess: [0, 0, 0, 0],
        tolerance: 1e-6,
        max_iterations: 100
      });
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
      <h2 className="method-title">Método de Jacobi</h2>
      
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
                <div className="examples-section mb-4">
                  <h5>Ejemplos predefinidos:</h5>
                  <div className="example-buttons">
                    <Button 
                      variant="outline-primary" 
                      onClick={() => loadExample(1)}
                      className="me-2"
                    >
                      Ejemplo 1 (3x3)
                    </Button>
                    <Button 
                      variant="outline-primary" 
                      onClick={() => loadExample(2)}
                    >
                      Ejemplo 2 (4x4)
                    </Button>
                  </div>
                </div>
                
                <Form.Group className="mb-3">
                  <Form.Label>Tamaño de la matriz</Form.Label>
                  <Form.Select
                    value={matrixSize}
                    onChange={handleMatrixSizeChange}
                  >
                    <option value="2">2x2</option>
                    <option value="3">3x3</option>
                    <option value="4">4x4</option>
                    <option value="5">5x5</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Matriz de coeficientes (A)</Form.Label>
                  <div className="matrix-input">
                    {Array(matrixSize).fill().map((_, rowIndex) => (
                      <div key={`row-${rowIndex}`} className="matrix-row">
                        {Array(matrixSize).fill().map((_, colIndex) => (
                          <Form.Control
                            key={`cell-${rowIndex}-${colIndex}`}
                            type="number"
                            step="any"
                            value={formData.A[rowIndex][colIndex]}
                            onChange={(e) => handleMatrixAChange(rowIndex, colIndex, e.target.value)}
                            className="matrix-cell"
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Vector de términos independientes (b)</Form.Label>
                  <div className="vector-input">
                    {Array(matrixSize).fill().map((_, index) => (
                      <Form.Control
                        key={`b-${index}`}
                        type="number"
                        step="any"
                        value={formData.b[index]}
                        onChange={(e) => handleVectorBChange(index, e.target.value)}
                        className="vector-cell"
                      />
                    ))}
                  </div>
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Vector de aproximación inicial (opcional)</Form.Label>
                  <div className="vector-input">
                    {Array(matrixSize).fill().map((_, index) => (
                      <Form.Control
                        key={`initial-${index}`}
                        type="number"
                        step="any"
                        value={formData.initial_guess[index]}
                        onChange={(e) => handleInitialGuessChange(index, e.target.value)}
                        className="vector-cell"
                      />
                    ))}
                  </div>
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
                  <h4>Convergencia:</h4>
                  <p className={`result-value ${result.converged ? 'text-success' : 'text-danger'}`}>
                    {result.converged ? 'Sí' : 'No'}
                  </p>
                </div>
                
                <div className="result-item">
                  <h4>Iteraciones:</h4>
                  <p className="result-value">
                    {result.iterations}
                  </p>
                </div>
                
                <div className="result-item">
                  <h4>Error final:</h4>
                  <p className="result-value">
                    {safeToExponential(result.error)}
                  </p>
                </div>
              </div>
              
              <h4 className="solution-title">Solución del sistema</h4>
              <div className="solution-vector">
                {result.solution && result.solution.map((value, index) => (
                  <div key={`sol-${index}`} className="solution-item">
                    <span className="solution-variable">x<sub>{index+1}</sub> = </span>
                    <span className="solution-value">{safeToFixed(value, 8)}</span>
                  </div>
                ))}
              </div>
              
              {/* Tabla de iteraciones */}
              {result.iteration_history && result.iteration_history.length > 0 && (
                <>
                  <h4 className="iterations-title">Tabla de Iteraciones</h4>
                  <div className="table-responsive">
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Iteración</th>
                          {result.solution && Array.from({ length: result.solution.length }).map((_, i) => (
                            <th key={`header-x${i+1}`}>x<sub>{i+1}</sub></th>
                          ))}
                          <th>Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.iteration_history.map((iter, index) => (
                          <tr key={index}>
                            <td>{index}</td>
                            {iter.values.map((val, i) => (
                              <td key={`iter-${index}-val-${i}`}>{safeToFixed(val, 6)}</td>
                            ))}
                            <td>{safeToExponential(iter.error)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </>
              )}
              
              {result.warnings && result.warnings.length > 0 && (
                <Alert variant="warning" className="mt-4">
                  <h4>Advertencias:</h4>
                  <ul>
                    {result.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </Alert>
              )}
              
              {result.convergence_details && (
                <div className="convergence-details mt-4">
                  <h4>Detalles de convergencia:</h4>
                  <ul>
                    {Object.entries(result.convergence_details).map(([key, value]) => (
                      <li key={key}>
                        <strong>{key.replace(/_/g, ' ')}:</strong> {
                          typeof value === 'number' ? safeToFixed(value, 4) : 
                          Array.isArray(value) ? `[${value.map(v => safeToFixed(v, 4)).join(', ')}]` : 
                          String(value)
                        }
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card.Body>
          </Card>
        )}
        
        {activeTab === 'theory' && (
          <Card className="theory-card">
            <Card.Body>
              <h3 className="theory-title">Teoría del Método de Jacobi</h3>
              
              <div className="theory-section">
                <h4>Definición</h4>
                <p>
                  El método de Jacobi es un algoritmo iterativo para resolver sistemas de ecuaciones lineales de la forma Ax = b.
                  Es especialmente útil para sistemas grandes y dispersos.
                </p>
              </div>
              
              <div className="theory-section">
                <h4>Algoritmo</h4>
                <ol>
                  <li>Descomponer la matriz A en A = D + R, donde D es la matriz diagonal y R es el resto</li>
                  <li>Reescribir el sistema como x = D⁻¹(b - Rx)</li>
                  <li>Elegir un vector inicial x⁽⁰⁾</li>
                  <li>Calcular iterativamente x⁽ᵏ⁺¹⁾ usando la fórmula:
                    <div className="formula">
                      x<sub>i</sub>⁽ᵏ⁺¹⁾ = (b<sub>i</sub> - ∑<sub>j≠i</sub> a<sub>ij</sub>x<sub>j</sub>⁽ᵏ⁾) / a<sub>ii</sub>
                    </div>
                  </li>
                  <li>Continuar hasta que ||x⁽ᵏ⁺¹⁾ - x⁽ᵏ⁾|| &lt; tolerancia o se alcance el máximo de iteraciones</li>
                </ol>
              </div>
              
              <div className="theory-section">
                <h4>Convergencia</h4>
                <p>
                  El método de Jacobi converge si:
                </p>
                <ul>
                  <li>La matriz A es diagonalmente dominante (|a<sub>ii</sub>| &gt; ∑<sub>j≠i</sub> |a<sub>ij</sub>| para todo i)</li>
                  <li>El radio espectral de la matriz de iteración es menor que 1</li>
                </ul>
                <p>
                  La velocidad de convergencia depende de qué tan cerca esté el radio espectral de 0.
                </p>
              </div>
              
              <div className="theory-section">
                <h4>Ventajas y Desventajas</h4>
                <p><strong>Ventajas:</strong></p>
                <ul>
                  <li>Simple de implementar</li>
                  <li>Cada iteración puede calcularse en paralelo</li>
                  <li>Funciona bien para matrices diagonalmente dominantes</li>
                </ul>
                <p><strong>Desventajas:</strong></p>
                <ul>
                  <li>Convergencia lenta comparada con otros métodos</li>
                  <li>No converge para todos los sistemas</li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Jacobi;