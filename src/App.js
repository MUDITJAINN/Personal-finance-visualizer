import { useState } from 'react';
import './App.css';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// TransactionForm Component
function TransactionForm({ onAdd }) {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!desc || !amount || !date || !category) return;
    const newTx = {
      id: Date.now(),
      desc,
      amount: +amount,
      date,
      category,
    };
    onAdd(newTx);
    setDesc('');
    setAmount('');
    setDate('');
    setCategory('');
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" />
      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" />
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" />
      <button type="submit">Add Transaction</button>
    </form>
  );
}

// TransactionList Component
function TransactionList({ transactions, onDelete }) {
  return (
    <ul>
      {transactions.map((tx) => (
        <li key={tx.id}>
          {tx.date} - {tx.desc} - ₹{tx.amount} ({tx.category})
          <button onClick={() => onDelete(tx.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}

// MonthlyChart Component
function MonthlyChart({ transactions }) {
  const grouped = transactions.reduce((acc, tx) => {
    const month = new Date(tx.date).toLocaleString('default', { month: 'short' });
    acc[month] = (acc[month] || 0) + tx.amount;
    return acc;
  }, {});

  const data = Object.entries(grouped).map(([month, total]) => ({
    month,
    total,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="total" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// CategoryPieChart Component
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6666'];

function CategoryPieChart({ transactions }) {
  const grouped = transactions.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
    return acc;
  }, {});

  const data = Object.entries(grouped).map(([category, total]) => ({
    name: category,
    value: total,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          outerRadius={80}
          fill="#8884d8"
          label
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

// BudgetForm Component
function BudgetForm({ onSetBudget }) {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!category || !amount) return;
    onSetBudget(category, +amount);
    setCategory('');
    setAmount('');
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" />
      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Monthly Budget" />
      <button type="submit">Set Budget</button>
    </form>
  );
}

// BudgetChart Component
function BudgetChart({ budgets, transactions }) {
  const grouped = transactions.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
    return acc;
  }, {});

  const data = Object.keys(budgets).map((category) => ({
    category,
    Budgeted: budgets[category],
    Spent: grouped[category] || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <XAxis dataKey="category" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Budgeted" fill="#8884d8" />
        <Bar dataKey="Spent" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Main App Component
function App() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState({});

  const addTransaction = (tx) => setTransactions((prev) => [...prev, tx]);
  const deleteTransaction = (id) => setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  const onSetBudget = (cat, amt) => setBudgets((prev) => ({ ...prev, [cat]: amt }));

  const totalExpenses = transactions.reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="App">
      <h1>Personal Finance Visualizer</h1>

      <TransactionForm onAdd={addTransaction} />
      <div className="charts">
        <MonthlyChart transactions={transactions} />
        <CategoryPieChart transactions={transactions} />
      </div>

      <div className="summary">
        <p>Total Expenses: ₹{totalExpenses}</p>
        <p>Recent Transactions: {transactions.slice(-3).map((tx) => tx.desc).join(', ')}</p>
      </div>

      <BudgetForm onSetBudget={onSetBudget} />
      <BudgetChart budgets={budgets} transactions={transactions} />
      <TransactionList transactions={transactions} onDelete={deleteTransaction} />
    </div>
  );
}

export default App;