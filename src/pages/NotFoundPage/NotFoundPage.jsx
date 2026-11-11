import './NotFoundPage.css';
import bonobono from '../../assets/images/bonobono.png';

function NotFoundPage({ onNavigate }) {
  return (
    <main className="not-found-page">
      <section className="not-found-page__content" aria-labelledby="not-found-title">
        <img className='bonobono' src={bonobono} alt="보노보노" />
        <h1 id="not-found-title">페이지를 찾을 수 없습니다</h1>
        <p className="not-found-page__description">
          주소가 잘못 입력되었거나 페이지가 이동 또는 삭제되었을 수 있어요.
        </p>
        <button className="not-found-page__home-button" type="button" onClick={onNavigate}>
          처음 화면으로 돌아가기
        </button>
      </section>
    </main>
  );
}

export default NotFoundPage;
