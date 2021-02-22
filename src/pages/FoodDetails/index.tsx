import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useLayoutEffect,
} from 'react';
import { Image } from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import formatValue from '../../utils/formatValue';

import {
  fetchFood,
  getFavorite,
  postFavorite,
  deleteFavorite,
  postOrder,
} from '../../services/api';

import {
  Container,
  Header,
  ScrollContainer,
  FoodsContainer,
  Food,
  FoodImageContainer,
  FoodContent,
  FoodTitle,
  FoodDescription,
  FoodPricing,
  AdditionalsContainer,
  Title,
  TotalContainer,
  AdittionalItem,
  AdittionalItemText,
  AdittionalQuantity,
  PriceButtonContainer,
  TotalPrice,
  QuantityContainer,
  FinishOrderButton,
  ButtonText,
  IconContainer,
} from './styles';

interface Params {
  id: number;
}

interface Extra {
  id: number;
  name: string;
  value: number;
  quantity: number;
}

export interface Food {
  id: number;
  name: string;
  description: string;
  price: string;
  image_url: string;
  formattedPrice: string;
  extras: Extra[];
  category: number;
  thumbnail_url: string;
}

const FoodDetails: React.FC = () => {
  const [food, setFood] = useState({} as Food);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [foodQuantity, setFoodQuantity] = useState(1);

  const navigation = useNavigation();
  const route = useRoute();

  const { id } = route.params as Params;

  const [isFavorite, setIsFavorite] = useState<boolean>();

  useEffect(() => {
    getFavorite(id).then(data => setIsFavorite(Boolean(data)));
  }, [id]);

  useEffect(() => {
    fetchFood(id).then(data => {
      setFood(data);

      setExtras(
        data.extras.map((extra: Extra) => ({
          ...extra,
          quantity: 0,
        })),
      );
    });
  }, [id]);

  useEffect(() => {
    if (!isFavorite) {
      deleteFavorite(food.id);

      return;
    }

    postFavorite(food);
  }, [food, isFavorite]);

  function handleIncrementExtra(extraId: number): void {
    setExtras(prev =>
      prev.map(extra => {
        const isExtra = extra.id === extraId;

        if (isExtra) {
          return {
            ...extra,
            quantity: extra.quantity + 1,
          };
        }

        return extra;
      }),
    );
  }

  function handleDecrementExtra(extraId: number): void {
    setExtras(prev =>
      prev.map(extra => {
        const isExtra = extra.id === extraId;

        if (isExtra) {
          return {
            ...extra,
            quantity: Math.max(extra.quantity - 1, 0),
          };
        }

        return extra;
      }),
    );
  }

  function handleIncrementFood(): void {
    setFoodQuantity(prev => prev + 1);
  }

  function handleDecrementFood(): void {
    setFoodQuantity(prev => Math.max(prev - 1, 1));
  }

  const toggleFavorite = useCallback(() => {
    setIsFavorite(prev => !prev);
  }, []);

  const cartTotal = useMemo(() => {
    const foodPrice = parseFloat(food.price);

    const extrasPrice = extras.reduce(
      (acc, extra) => (acc + extra.value) * extra.quantity,
      0,
    );

    return (foodPrice + extrasPrice) * foodQuantity;
  }, [extras, food, foodQuantity]);

  const formattedCartTotal = formatValue(cartTotal);

  async function handleFinishOrder(): Promise<void> {
    const {
      id: product_id,
      name,
      description,
      price,
      category,
      thumbnail_url,
    } = food;

    const order = {
      product_id,
      name,
      description,
      price,
      category,
      thumbnail_url,
      extras,
    };

    postOrder(order).then(() => navigation.navigate('DashboardStack'));
  }

  const favoriteIconName = useMemo(
    () => (isFavorite ? 'favorite' : 'favorite-border'),
    [isFavorite],
  );

  useLayoutEffect(() => {
    // Add the favorite icon on the right of the header bar
    navigation.setOptions({
      headerRight: () => (
        <MaterialIcon
          name={favoriteIconName}
          size={24}
          color="#FFB84D"
          onPress={() => toggleFavorite()}
        />
      ),
    });
  }, [navigation, favoriteIconName, toggleFavorite]);

  return (
    <Container>
      <Header />

      <ScrollContainer>
        <FoodsContainer>
          <Food>
            <FoodImageContainer>
              <Image
                style={{ width: 327, height: 183 }}
                source={{
                  uri: food.image_url,
                }}
              />
            </FoodImageContainer>
            <FoodContent>
              <FoodTitle>{food.name}</FoodTitle>
              <FoodDescription>{food.description}</FoodDescription>
              <FoodPricing>{food.formattedPrice}</FoodPricing>
            </FoodContent>
          </Food>
        </FoodsContainer>
        <AdditionalsContainer>
          <Title>Adicionais</Title>
          {extras.map(extra => (
            <AdittionalItem key={extra.id}>
              <AdittionalItemText>{extra.name}</AdittionalItemText>
              <AdittionalQuantity>
                <Icon
                  size={15}
                  color="#6C6C80"
                  name="minus"
                  onPress={() => handleDecrementExtra(extra.id)}
                  testID={`decrement-extra-${extra.id}`}
                />
                <AdittionalItemText testID={`extra-quantity-${extra.id}`}>
                  {extra.quantity}
                </AdittionalItemText>
                <Icon
                  size={15}
                  color="#6C6C80"
                  name="plus"
                  onPress={() => handleIncrementExtra(extra.id)}
                  testID={`increment-extra-${extra.id}`}
                />
              </AdittionalQuantity>
            </AdittionalItem>
          ))}
        </AdditionalsContainer>
        <TotalContainer>
          <Title>Total do pedido</Title>
          <PriceButtonContainer>
            <TotalPrice testID="cart-total">{formattedCartTotal}</TotalPrice>
            <QuantityContainer>
              <Icon
                size={15}
                color="#6C6C80"
                name="minus"
                onPress={handleDecrementFood}
                testID="decrement-food"
              />
              <AdittionalItemText testID="food-quantity">
                {foodQuantity}
              </AdittionalItemText>
              <Icon
                size={15}
                color="#6C6C80"
                name="plus"
                onPress={handleIncrementFood}
                testID="increment-food"
              />
            </QuantityContainer>
          </PriceButtonContainer>

          <FinishOrderButton onPress={() => handleFinishOrder()}>
            <ButtonText>Confirmar pedido</ButtonText>
            <IconContainer>
              <Icon name="check-square" size={24} color="#fff" />
            </IconContainer>
          </FinishOrderButton>
        </TotalContainer>
      </ScrollContainer>
    </Container>
  );
};

export default FoodDetails;
