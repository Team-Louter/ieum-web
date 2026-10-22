import productImage from '../../assets/images/comment.png';
import profileImage from '../../assets/images/profile.png';

/** 중고장터 화면 확인용 데이터입니다. API 응답과 같은 필드 구조를 사용합니다. */
export const dummyMarketProducts = [
  { id: 'wooden-chair', title: '원목 의자', price: '15,000원', address: '구지면 창리', description: '사용감이 적은 원목 의자입니다.', image: productImage, seller: { id: '아이디', profileImage } },
  { id: 'coffee-cup', title: '커피잔 세트', price: '8,000원', address: '구지면 창리', description: '깨끗하게 사용한 커피잔 세트입니다.', image: productImage, seller: { id: '도현', profileImage } },
  { id: 'floor-lamp', title: '스탠드 조명', price: '20,000원', address: '구지면 창리', description: '은은한 빛의 스탠드 조명입니다.', image: productImage, seller: { id: '정연', profileImage } },
  { id: 'flower-pot', title: '화분', price: '5,000원', address: '구지면 창리', description: '튼튼한 도자기 화분입니다.', image: productImage, seller: { id: '강호', profileImage } },
  { id: 'blanket', title: '겨울 이불', price: '12,000원', address: '구지면 창리', description: '포근한 겨울용 이불입니다.', image: productImage, seller: { id: '현우', profileImage } },
  { id: 'book-shelf', title: '책장', price: '30,000원', address: '구지면 창리', description: '작은 공간에 두기 좋은 책장입니다.', image: productImage, seller: { id: '희린', profileImage } },
];

export const dummyMyMarketProducts = dummyMarketProducts.slice(0, 3);
