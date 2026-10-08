fetch('http://localhost:3000/api/pharmacy/sales')
  .then(res => res.json())
  .then(data => console.log(JSON.stringify(data.data.slice(0, 2), null, 2)))
  .catch(console.error);
