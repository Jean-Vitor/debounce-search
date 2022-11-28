import React, { ChangeEvent, useEffect, useState } from 'react';
import { useRef } from 'react';
import './App.css';

interface User {
  name: string;
  avatar: string;
  company: string;
  id: string;
}

interface Order {
  orderBy: string;
  direction: 'asc' | 'desc';
}

const Arrow = ({ active = false, direction = 'desc' }: { active?: boolean, direction?: 'desc' | 'asc' }) => {
  if (!active) return (
    <small>
      &#8593;
    </small>
  )


  return (
    <small style={{
      color: active ? 'blue' : '#000',
      transform: direction === 'desc' ? `rotate(180deg)` : `rotate(0deg)`
    }} >
      &#8593;
    </small>
  )
}

const useDebounce = <F extends (...args: Parameters<F>) => ReturnType<F>>(
  func: F,
  waitFor: number,
) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debounced = (...args: Parameters<F>) => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => func(...args), waitFor)
  }

  return debounced
}

function App() {
  const [data, setData] = useState<User[]>([]);
  const [search, setSearch] = useState<string>('');
  const [displaySearch, setDisplaySearch] = useState<string>('');
  const [order, setOrder] = useState<Order>({
    orderBy: 'name',
    direction: 'asc'
  });
  const [loading, setLoading] = useState(false);

  const debounceHandleSearch = useDebounce((value: string) => setSearch(value), 500)

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const response = await fetch(`https://63850ace3fa7acb14f08591d.mockapi.io/users?sortBy=${order.orderBy}&order=${order.direction}&search=${search}`);
      const userData = await response.json();
      setData(userData);
      setLoading(false);
    }

    fetchUserData();
  }, [order, search])

  const handleOrder = (fieldName: string) => {
    if (fieldName !== order.orderBy) {
      setOrder({
        orderBy: fieldName,
        direction: 'asc',
      })

      return;
    }

    setOrder(prevOrder => ({
      orderBy: fieldName,
      direction: prevOrder.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setDisplaySearch(event.target.value);
    debounceHandleSearch(event.target.value)
  };

  return (
    <div className="App">
      <h1>Users</h1>
      Search
      <input type="text" value={displaySearch} onChange={handleSearch} />
      Order
      <div className='actions'>
        <button onClick={() => handleOrder('name')}>
          <p style={{
            color: order.orderBy === 'name' ? 'blue' : '#000'
          }}>Name</p>
          <Arrow active={order.orderBy === 'name'} direction={order.direction} />
        </button>
        <button onClick={() => handleOrder('company')}>
          <p style={{
            color: order.orderBy === 'company' ? 'blue' : '#000'
          }}>Company</p>
          <Arrow active={order.orderBy === 'company'} direction={order.direction} />
        </button>
      </div>

      {loading ?
        <h1>Carregando dados...</h1>
        : data.map((user) => (
          <div key={user.id} className='user-card'>
            <img src={user.avatar} alt="user avatar" />
            <div className='user-infos'>
              <p>{user.name}</p>
              <small>{user.company}</small>
            </div>
          </div>
        ))}
    </div>
  );
}

export default App;
