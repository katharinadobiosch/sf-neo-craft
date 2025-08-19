import {AddToCartButton} from '~/patterns/Cart/AddToCartButton';
import {useAside} from '~/patterns/Aside';

export function ProductForm({selectedVariant}) {
  const {open} = useAside();

  return (
    <div className="pdp-form">
      <AddToCartButton
        disabled={!selectedVariant || !selectedVariant.availableForSale}
        onClick={() => open('cart')}
        lines={
          selectedVariant
            ? [{merchandiseId: selectedVariant.id, quantity: 1}]
            : []
        }
      >
        {selectedVariant?.availableForSale ? 'Add to Cart' : 'Sold out'}
      </AddToCartButton>
    </div>
  );
}
