import Downloads, {loader as downloadsLoader} from '~/patterns/Downloads';
import './downloads.scss';

export const loader = downloadsLoader;

export default function DownloadsPage() {
  return <Downloads />;
}
