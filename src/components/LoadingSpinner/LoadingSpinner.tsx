import * as S from './LoadingSpinner.styles';

type LoadingSpinnerProps = {
  message?: string;
};

export function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <S.Overlay>
      <S.SpinnerContainer>
        <S.Spinner />
        <S.Message>{message}</S.Message>
      </S.SpinnerContainer>
    </S.Overlay>
  );
}

export default LoadingSpinner;
