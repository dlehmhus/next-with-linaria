import { NextPage } from 'next';

import CssModuleButton from '../../components/clientComponents/CssModuleLink';
import LinariaButton from '../../components/clientComponents/LinariaLink';
import ServerContainer from '../../components/serverComponents/ServerContainer';

const PagesPage: NextPage = () => {
  return (
    <ServerContainer>
      <CssModuleButton />
      <LinariaButton />
    </ServerContainer>
  );
};

export default PagesPage;
