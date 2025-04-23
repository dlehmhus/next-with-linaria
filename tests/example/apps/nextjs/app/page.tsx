import { UiKitButton } from 'ui-kit';

import CssModuleButton from '../components/clientComponents/CssModuleLink';
import LinariaLink from '../components/clientComponents/LinariaLink';
import ServerContainer from '../components/serverComponents/ServerContainer';
export default function Home() {
  return (
    <ServerContainer>
      <CssModuleButton />
      <LinariaLink />
      <UiKitButton />
    </ServerContainer>
  );
}
