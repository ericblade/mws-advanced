import { Currency } from '../../lib/index';
export type BuyerCustomizedInfo = any;
export type PointsGranted = any;
export type ProductInfo = any;
export type TaxCollection = any;

export type OrderItem = {
    ASIN: string,
    OrderItemId: string,
    SellerSKU?: string,
    BuyerCustomizedInfo?: BuyerCustomizedInfo,
    Title?: string,
    QuantityOrdered?: number,
    QuantityShipped?: number,
    PointsGranted?: PointsGranted,
    ProductInfo?: ProductInfo,
    ItemPrice?: Currency,
    ShippingPrice?: Currency,
    GiftWrapPrice?: Currency,
    TaxCollection?: TaxCollection,
    ItemTax?: Currency,
    ShippingTax?: Currency,
    GiftWrapTax?: Currency,
    ShippingDiscount?: Currency,
    ShippingDiscountTax?: Currency,
    PromotionDiscount?: Currency,
    PromotionDiscountTax?: Currency,
    PromotionIds?: Array<string>,
    CODFee?: Currency,
    CODFeeDiscount?: Currency,
    IsGift?: boolean,
    GiftMessageText?: string,
    GiftWrapLevel?: string,
    ConditionNote?: string,
    ConditionId?: 'New' | 'Used' | 'Collectible' | 'Refurbished' | 'Preorder' | 'Club',
    ConditionSubtypeId?: 'New' | 'Mint' | 'Very Good' | 'Good' | 'Acceptable' | 'Poor' | 'Club' | 'OEM' | 'Warranty' | 'Refurbished Warranty' | 'Refurbished' | 'Open Box' | 'Any' | 'Other',
    ScheduledDeliveryStartDate?: string,
    ScheduledDeliveryEndDate?: string,
    PriceDesignation?: 'BusinessPrice',
    IsTransparency?: boolean,
    SerialNumberRequired?: boolean,
};