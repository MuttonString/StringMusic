import { useTranslation } from 'react-i18next';
import DialogTemplate from '../DialogTemplate';

interface IProps {
  open: boolean;
  onClose: () => void;
}

export default function LibraryInfoDialog(props: IProps) {
  const { t } = useTranslation();

  return (
    <DialogTemplate
      maxWidth='xs'
      title={t('settingsDrawer.about.openSourceLib')}
      {...props}
    ></DialogTemplate>
  );
}
