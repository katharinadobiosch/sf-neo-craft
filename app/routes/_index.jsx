// app/routes/_index.jsx
import {redirect} from 'react-router';

export async function loader() {
  return redirect('/collections/main-collection');
}

export default function Homepage() {
  return null;
}
