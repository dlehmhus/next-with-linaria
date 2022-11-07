import { UiKitButton } from 'ui-kit';

import CssModuleButton from '../components/clientComponents/CssModuleLink';
import LinariaButton from '../components/clientComponents/LinariaLink';
import ServerContainer from '../components/serverComponents/ServerContainer';

export default function Home() {
  return (
    <ServerContainer>
      <CssModuleButton />
      <LinariaButton />
      <UiKitButton />
    </ServerContainer>
  );
}
