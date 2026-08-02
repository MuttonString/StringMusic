import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import type { PopoverVirtualElement } from '@mui/material/Popover';
import useDelayedState from '../../hooks/useDelayedState';
import useDetailHistory from '../../hooks/useDetailHistory';
import useSettings from '../../hooks/useSettings';

interface IProps {
  isBack: boolean;
  anchorEl:
    | Element
    | PopoverVirtualElement
    | (() => Element | PopoverVirtualElement | null)
    | null
    | undefined;
  onClose: () => void;
}

export default function BrowsingHistory(props: IProps) {
  const { isBack, anchorEl, onClose } = props;
  const { prev, next, goBack, goForward } = useDetailHistory();
  const [settings] = useSettings();
  const delay = (settings?.personalization.animationDuration ?? 1) * 300;
  const [prevDelayed, isPrevPending] = useDelayedState(prev, delay);
  const [nextDelayed, isNextPending] = useDelayedState(next, delay);

  return (
    <Menu
      anchorEl={anchorEl}
      open={!!anchorEl}
      onClose={onClose}
      style={
        isPrevPending || isNextPending ? { pointerEvents: 'none' } : undefined
      }
    >
      {(isBack ? [...prevDelayed].reverse() : nextDelayed).map(
        (item, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              if (isBack) {
                goBack(index + 1);
              } else {
                goForward(index + 1);
              }
              onClose();
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText>{item.title}</ListItemText>
          </MenuItem>
        ),
      )}
    </Menu>
  );
}
