// app/routes/main-collection.jsx
import MainCollection, {
  loader as mainCollectionLoader,
} from '../patterns/MainCollection';

export const loader = mainCollectionLoader;
export default function MainCollectionPage() {
  return <MainCollection />;
}
