import { NextPage } from 'next';

import CssModuleButton from '../../components/clientComponents/CssModuleLink';
import LinariaLink from '../../components/clientComponents/LinariaLink';
import ServerContainer from '../../components/serverComponents/ServerContainer';

const PagesPage: NextPage = () => {
  return (
    <ServerContainer>
      <CssModuleButton />
      <LinariaLink />
    </ServerContainer>
  );
};

export default PagesPage;
