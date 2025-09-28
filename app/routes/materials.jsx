// app/routes/materials.jsx
import Materials, {loader as materialsLoader} from '../patterns/Materials';

export const loader = materialsLoader;
export default function MaterialsPage() {
  return <Materials />;
}
