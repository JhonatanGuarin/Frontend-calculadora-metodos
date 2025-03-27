import React, { useState } from 'react';
import { Card, Form, Button, Alert, Spinner, Table } from 'react-bootstrap';
import { metodosGaussSeidel } from '../../services/api';
import '../../styles/Metodos.css';
import 'katex/dist/katex.min.css';

const GaussSeidel = () => {
  const [formData, setFormData] = useState({
    A: [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ],
    b: [0, 0, 0],
    x0: [0, 0, 0],
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
    
    // Crear nueva matriz A y vectores b e x0 con el nuevo tamaño
    const newA = Array(newSize).fill().map(() => Array(newSize).fill(0));
    const newB = Array(newSize).fill(0);
    const newInitialGuess = Array(newSize).fill(0);
    
    setFormData({
      ...formData,
      A: newA,
      b: newB,
      x0: newInitialGuess
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
    const newInitialGuess = [...formData.x0];
    newInitialGuess[index] = parseFloat(value) || 0;
    setFormData({ ...formData, x0: newInitialGuess });
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
      const response = await metodosGaussSeidel.solve(formData);
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
        x0: [0, 0, 0],
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
        x0: [0, 0, 0, 0],
        tolerance: 1e-6,
        max_iterations: 100
      });
    } else if (exampleNumber === 3) {
      // Ejemplo 3: Sistema que converge más rápido con Gauss-Seidel que con Jacobi
      setMatrixSize(3);
      setFormData({
        A: [
          [4, -1, 0],
          [-1, 4, -1],
          [0, -1, 4]
        ],
        b: [3, 6, 3],
        x0: [0, 0, 0],
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
      <h2 className="method-title">Método de Gauss-Seidel</h2>
      
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
                      className="me-2"
                    >
                      Ejemplo 2 (4x4)
                    </Button>
                    <Button 
                      variant="outline-primary" 
                      onClick={() => loadExample(3)}
                    >
                      Ejemplo 3 (Rápida convergencia)
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
                        value={formData.x0[index]}
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
              
              {result.comparison_with_jacobi && (
                <div className="comparison-details mt-4">
                  <h4>Comparación con el método de Jacobi:</h4>
                  <ul>
                    <li>
                      <strong>Radio espectral de Jacobi:</strong> {safeToFixed(result.comparison_with_jacobi.jacobi_spectral_radius, 6)}
                    </li>
                    <li>
                      <strong>Radio espectral de Gauss-Seidel:</strong> {safeToFixed(result.comparison_with_jacobi.gauss_seidel_spectral_radius, 6)}
                    </li>
                    {result.comparison_with_jacobi.estimated_speedup && (
                      <li>
                        <strong>Aceleración estimada:</strong> {safeToFixed(result.comparison_with_jacobi.estimated_speedup, 2)}x más rápido
                      </li>
                    )}
                    {result.comparison_with_jacobi.conclusion && (
                      <li>
                        <strong>Conclusión:</strong> {result.comparison_with_jacobi.conclusion}
                      </li>
                    )}
                  </ul>
                </div>
              )}
              
              {result.iteration_history && result.iteration_history.length > 0 && (
                <div className="iteration-history mt-4">
                  <h4>Historial de Iteraciones</h4>
                  <div className="table-responsive">
                    <Table striped bordered hover size="sm">
                      <thead>
                        <tr>
                          <th>Iteración</th>
                          {result.solution.map((_, index) => (
                            <th key={`header-x${index+1}`}>x<sub>{index+1}</sub></th>
                          ))}
                          <th>Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.iteration_history.map((iter, index) => (
                          <tr key={`iter-${index}`}>
                            <td>{iter.iteration}</td>
                            {iter.solution.map((val, idx) => (
                              <td key={`iter-${index}-x${idx+1}`}>{safeToFixed(val, 6)}</td>
                            ))}
                            <td>{safeToExponential(iter.error)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        )}
        
        {activeTab === 'theory' && (
          <Card className="theory-card">
            <Card.Body>
              <h3 className="theory-title">Teoría del Método de Gauss-Seidel</h3>
              
              <div className="theory-section">
                <h4>Definición</h4>
                <p>
                  El método de Gauss-Seidel es un algoritmo iterativo para resolver sistemas de ecuaciones lineales de la forma Ax = b.
                  Es una mejora del método de Jacobi, ya que utiliza los valores más recientes calculados en la misma iteración.
                </p>
              </div>
              
              <div className="theory-section">
                <h4>Algoritmo</h4>
                <ol>
                  <li>Descomponer la matriz A en A = D + L + U, donde:
                    <ul>
                      <li>D es la matriz diagonal</li>
                      <li>L es la matriz triangular inferior estricta</li>
                      <li>U es la matriz triangular superior estricta</li>
                    </ul>
                  </li>
                  <li>Reescribir el sistema como (D+L)x = b - Ux</li>
                  <li>Elegir un vector inicial x⁽⁰⁾</li>
                  <li>Calcular iterativamente x⁽ᵏ⁺¹⁾ usando la fórmula:
                    <div className="formula">
                      x<sub>i</sub>⁽ᵏ⁺¹⁾ = (b<sub>i</sub> - ∑<sub>j&lt;i</sub> a<sub>ij</sub>x<sub>j</sub>⁽ᵏ⁺¹⁾ - ∑<sub>j&gt;i</sub> a<sub>ij</sub>x<sub>j</sub>⁽ᵏ⁾) / a<sub>ii</sub>
                    </div>
                  </li>
                  <li>Continuar hasta que ||x⁽ᵏ⁺¹⁾ - x⁽ᵏ⁾|| &lt; tolerancia o se alcance el máximo de iteraciones</li>
                </ol>
              </div>
              
              <div className="theory-section">
                <h4>Convergencia</h4>
                <p>
                  El método de Gauss-Seidel converge si:
                </p>
                <ul>
                  <li>La matriz A es diagonalmente dominante (|a<sub>ii</sub>| &gt; ∑<sub>j≠i</sub> |a<sub>ij</sub>| para todo i)</li>
                  <li>La matriz A es simétrica y definida positiva</li>
                  <li>El radio espectral de la matriz de iteración es menor que 1</li>
                </ul>
                <p>
                  En general, Gauss-Seidel converge más rápido que Jacobi cuando ambos convergen.
                </p>
              </div>
              
              <div className="theory-section">
                <h4>Comparación con Jacobi</h4>
                <p>
                  <strong>Diferencias principales:</strong>
                </p>
                <ul>
                  <li>Gauss-Seidel utiliza los valores más recientes calculados en la misma iteración</li>
                  <li>Jacobi utiliza solo valores de la iteración anterior</li>
                  <li>Gauss-Seidel generalmente converge más rápido que Jacobi</li>
                  <li>Gauss-Seidel requiere menos almacenamiento (puede actualizar in-place)</li>
                  <li>Jacobi es más fácil de paralelizar</li>
                </ul>
              </div>
              
              <div className="theory-section">
                <h4>Ventajas y Desventajas</h4>
                <p><strong>Ventajas:</strong></p>
                <ul>
                  <li>Converge más rápido que Jacobi en la mayoría de los casos</li>
                  <li>Requiere menos memoria que Jacobi</li>
                  <li>Funciona bien para matrices diagonalmente dominantes</li>
                </ul>
                <p><strong>Desventajas:</strong></p>
                <ul>
                  <li>Más difícil de paralelizar que Jacobi</li>
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

export default GaussSeidel;