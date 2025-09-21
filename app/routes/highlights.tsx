// app/routes/highlights.tsx
import Highlights, {loader as highlightsLoader} from '../patterns/Highlights';

export const loader = highlightsLoader; // <— wichtig
export default function HighlightsPageWithProps() {
  return <Highlights />;
}
