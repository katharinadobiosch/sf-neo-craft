import Materials, {loader as materialsLoader} from '../patterns/Materials';

export const loader = materialsLoader; // <— wichtig
export default function MaterialsPageWithProps() {
  return <Materials />;
}
