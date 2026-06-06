import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import chroma from 'chroma-js';
import type { MouseEvent, TouchEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SimpleBar from 'simplebar-react';
import Tip from '../Tip';
import styles from './index.module.less';

interface IProps {
  open: boolean;
  onClose: () => void;
  color: string;
  onColorChanged: (color: string) => void;
}

const PICKER_SIZE = 192;

const limitRange = (value: string | number, max: number) => {
  const num = Number(value);
  if (num < 0) return 0;
  if (num > max) return max;
  return num;
};

export default function ColorDialog(props: IProps) {
  const { open, onClose, color, onColorChanged } = props;
  const { t } = useTranslation();
  const [chromaColor, setChromaColor] = useState(chroma(color));

  const [hexInput, setHexInput] = useState(chroma(color).hex().slice(1));
  const [rInput, setRInput] = useState('');
  const [gInput, setGInput] = useState('');
  const [bInput, setBInput] = useState('');
  const [hInput, setHInput] = useState(
    String(Math.round(chroma(color).get('hsv.h') || 0)),
  );
  const [sInput, setSInput] = useState(
    String(Math.round(chroma(color).get('hsv.s'))),
  );
  const [vInput, setVInput] = useState(
    String(Math.round(chroma(color).get('hsv.v'))),
  );

  const dragSaturationRef = useRef(false);
  const dragHueRef = useRef(false);

  const handleSaturationDrag = useCallback(
    (e: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>) => {
      e.preventDefault();
      const client = (e as TouchEvent).touches?.[0] || (e as MouseEvent);
      const rect = e.currentTarget.getBoundingClientRect();
      const x =
        document.documentElement.dir === 'rtl'
          ? PICKER_SIZE - limitRange(client.clientX - rect.left, PICKER_SIZE)
          : limitRange(client.clientX - rect.left, PICKER_SIZE);
      const y = limitRange(client.clientY - rect.top, PICKER_SIZE);
      const newColor = chroma.hsv(
        Number(hInput),
        x / PICKER_SIZE,
        1 - y / PICKER_SIZE,
      );
      setChromaColor(newColor);
      setHexInput(newColor.hex().slice(1));
    },
    [hInput],
  );

  const handleHueDrag = useCallback(
    (e: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>) => {
      e.preventDefault();
      const client = (e as TouchEvent).touches?.[0] || (e as MouseEvent);
      const rect = e.currentTarget.getBoundingClientRect();
      const y = limitRange(client.clientY - rect.top, PICKER_SIZE);
      const hue = (y * 360) / PICKER_SIZE;
      const newColor = chromaColor.set('hsl.h', hue);
      setChromaColor(newColor);
      setHInput(String(Math.round(hue)));
      setHexInput(newColor.hex().slice(1));
    },
    [chromaColor],
  );

  const handleSaturationDragStart = (
    e: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>,
  ) => {
    dragSaturationRef.current = true;
    handleSaturationDrag(e);
  };
  const handleHueDragStart = (
    e: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>,
  ) => {
    dragHueRef.current = true;
    handleHueDrag(e);
  };
  const handleSaturationDragEnd = () => (dragSaturationRef.current = false);
  const handleHueDragEnd = () => (dragHueRef.current = false);

  const getValidHue = (hue: number) => {
    if (isNaN(hue)) return hInput;
    return Math.round(hue);
  };

  useEffect(() => {
    setRInput(String(Math.round(chromaColor.get('rgb.r'))));
    setGInput(String(Math.round(chromaColor.get('rgb.g'))));
    setBInput(String(Math.round(chromaColor.get('rgb.b'))));
    const h = chromaColor.get('hsv.h');
    const v = chromaColor.get('hsv.v');
    setVInput(String(Math.round(v * 100)));
    if (!isNaN(h)) setHInput(String(Math.round(h)));
    if (v) setSInput(String(Math.round(chromaColor.get('hsv.s') * 100)));
  }, [chromaColor]);

  const setToRecommend = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    const val = e.currentTarget.style.background;
    const recommend = chroma(val);
    setChromaColor(recommend);
    setHexInput(recommend.hex().slice(1));
  }, []);

  return (
    <Dialog maxWidth='xs' fullWidth open={open}>
      <DialogTitle sx={{ padding: '8px 24px' }}>
        {t('colorDialog.title')}
      </DialogTitle>
      <DialogContent dividers sx={{ padding: 0 }}>
        <SimpleBar
          tabIndex={-1}
          className={styles.colorDialog}
          autoHide={false}
        >
          <div className={styles.picker}>
            <div
              className={styles.saturation}
              style={{
                minWidth: PICKER_SIZE + 'px',
                maxWidth: PICKER_SIZE + 'px',
                minHeight: PICKER_SIZE + 'px',
                maxHeight: PICKER_SIZE + 'px',
                backgroundColor: `hsl(${getValidHue(chromaColor.get('hsv.h'))}, 100%, 50%)`,
              }}
              onMouseDown={handleSaturationDragStart}
              onTouchStart={handleSaturationDragStart}
              onMouseUp={handleSaturationDragEnd}
              onMouseLeave={handleSaturationDragEnd}
              onTouchEnd={handleSaturationDragEnd}
              onTouchCancel={handleSaturationDragEnd}
              onMouseMove={(e) => {
                if (dragSaturationRef.current) handleSaturationDrag(e);
              }}
            >
              <div
                className={styles.slider}
                style={{
                  insetInlineStart: (PICKER_SIZE * Number(sInput)) / 100 + 'px',
                  top: (PICKER_SIZE * (100 - Number(vInput))) / 100 + 'px',
                }}
              />
            </div>
            <div
              className={styles.hue}
              style={{
                minHeight: PICKER_SIZE + 'px',
                maxHeight: PICKER_SIZE + 'px',
              }}
              onMouseDown={handleHueDragStart}
              onTouchStart={handleHueDragStart}
              onMouseUp={handleHueDragEnd}
              onMouseLeave={handleHueDragEnd}
              onTouchEnd={handleHueDragEnd}
              onTouchCancel={handleHueDragEnd}
              onMouseMove={(e) => {
                if (dragHueRef.current) handleHueDrag(e);
              }}
            >
              <div
                className={styles.slider}
                style={{
                  top: (PICKER_SIZE * Number(hInput)) / 360 + 'px',
                }}
              />
            </div>

            <div className={styles.preview}>
              <div className={styles.previewColor}>
                <span>{t('colorDialog.new')}</span>
                <div
                  className={styles.colorBlock}
                  style={{ background: chromaColor.hex() }}
                />
                <div
                  className={styles.colorBlock}
                  style={{ background: color }}
                />
                <span>{t('colorDialog.current')}</span>
              </div>
              <div className={styles.previewBtns}>
                <ThemeProvider
                  theme={createTheme({
                    palette: {
                      primary: { main: chromaColor.hex() },
                    },
                  })}
                >
                  <Button tabIndex={-1} size='small' variant='outlined'>
                    {t('colorDialog.preview')}
                  </Button>
                  <Button tabIndex={-1} size='small' variant='contained'>
                    {t('colorDialog.preview')}
                  </Button>
                </ThemeProvider>
              </div>
            </div>
          </div>

          <div className={styles.inputGroups}>
            <div className={styles.inputGroup}>
              <Tip title={t('colorDialog.r')}>
                <Input
                  startAdornment={
                    <InputAdornment position='start'>R</InputAdornment>
                  }
                  type='number'
                  inputProps={{ maxLength: 3 }}
                  value={rInput}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    if (!val) return setRInput('');
                    if (!/[0-9]/.test(val)) return;
                    const newColor = chromaColor.set(
                      'rgb.r',
                      limitRange(val, 255),
                    );
                    setChromaColor(newColor);
                    setHexInput(newColor.hex().slice(1));
                  }}
                  onBlur={(e) => {
                    if (!e.target.value) {
                      setRInput(String(chromaColor.get('rgb.r')));
                    }
                  }}
                />
              </Tip>
              <Tip title={t('colorDialog.g')}>
                <Input
                  aria-label='Green'
                  startAdornment={
                    <InputAdornment position='start'>G</InputAdornment>
                  }
                  type='number'
                  inputProps={{ maxLength: 3 }}
                  value={gInput}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    if (!val) return setGInput('');
                    if (!/[0-9]/.test(val)) return;
                    const newColor = chromaColor.set(
                      'rgb.g',
                      limitRange(val, 255),
                    );
                    setChromaColor(newColor);
                    setHexInput(newColor.hex().slice(1));
                  }}
                  onBlur={(e) => {
                    if (!e.target.value) {
                      setGInput(String(chromaColor.get('rgb.g')));
                    }
                  }}
                />
              </Tip>
              <Tip title={t('colorDialog.b')}>
                <Input
                  aria-label='Blue'
                  startAdornment={
                    <InputAdornment position='start'>B</InputAdornment>
                  }
                  type='number'
                  inputProps={{ maxLength: 3 }}
                  value={bInput}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    if (!val) return setBInput('');
                    if (!/[0-9]/.test(val)) return;
                    const newColor = chromaColor.set(
                      'rgb.b',
                      limitRange(val, 255),
                    );
                    setChromaColor(newColor);
                    setHexInput(newColor.hex().slice(1));
                  }}
                  onBlur={(e) => {
                    if (!e.target.value) {
                      setBInput(String(chromaColor.get('rgb.b')));
                    }
                  }}
                />
              </Tip>
            </div>

            <Divider />

            <div className={styles.inputGroup}>
              <Tip title={t('colorDialog.h')}>
                <Input
                  aria-label='Hue'
                  startAdornment={
                    <InputAdornment position='start'>H</InputAdornment>
                  }
                  endAdornment={
                    <InputAdornment position='end'>°</InputAdornment>
                  }
                  type='number'
                  inputProps={{ maxLength: 3 }}
                  value={hInput}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    if (!val) return setHInput('');
                    if (!/[0-9]/.test(val)) return;
                    const value = limitRange(val, 360);
                    const newColor = chromaColor.set('hsv.h', value);
                    setChromaColor(newColor);
                    setHexInput(newColor.hex().slice(1));
                    setHInput(String(value));
                  }}
                  onBlur={(e) => {
                    if (!e.target.value) {
                      setHInput(
                        String(Math.round(chromaColor.get('hsv.h') || 0)),
                      );
                    }
                  }}
                />
              </Tip>
              <Tip title={t('colorDialog.s')}>
                <Input
                  aria-label='Saturation'
                  startAdornment={
                    <InputAdornment position='start'>S</InputAdornment>
                  }
                  endAdornment={
                    <InputAdornment position='end'>%</InputAdornment>
                  }
                  type='number'
                  inputProps={{ maxLength: 3 }}
                  value={sInput}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    if (!val) return setSInput('');
                    if (!/[0-9]/.test(val)) return;
                    const value = limitRange(val, 100);
                    const newColor = chroma.hsv(
                      Number(hInput),
                      value / 100,
                      Number(vInput) / 100,
                    );
                    setChromaColor(newColor);
                    setHexInput(newColor.hex().slice(1));
                    setSInput(String(value));
                  }}
                  onBlur={(e) => {
                    if (!e.target.value) {
                      setSInput(String(Math.round(chromaColor.get('hsv.s'))));
                    }
                  }}
                />
              </Tip>
              <Tip title={t('colorDialog.v')}>
                <Input
                  aria-label='Value'
                  startAdornment={
                    <InputAdornment position='start'>V</InputAdornment>
                  }
                  endAdornment={
                    <InputAdornment position='end'>%</InputAdornment>
                  }
                  type='number'
                  inputProps={{ maxLength: 3 }}
                  value={vInput}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    if (!val) return setVInput('');
                    if (!/[0-9]/.test(val)) return;
                    const value = limitRange(val, 100);
                    const newColor = chroma.hsv(
                      Number(hInput),
                      Number(sInput) / 100,
                      limitRange(val, 100) / 100,
                    );
                    setChromaColor(newColor);
                    setHexInput(newColor.hex().slice(1));
                    setVInput(String(value));
                  }}
                  onBlur={(e) => {
                    if (!e.target.value) {
                      setVInput(String(Math.round(chromaColor.get('hsv.v'))));
                    }
                  }}
                />
              </Tip>
            </div>

            <Divider />

            <div className={styles.inputGroup}>
              <Tip title={t('colorDialog.hex')}>
                <Input
                  aria-label='Hex'
                  startAdornment={
                    <InputAdornment position='start'>#</InputAdornment>
                  }
                  inputProps={{ maxLength: 6 }}
                  value={hexInput}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    if (!val) return setHexInput('');
                    if (!/[0-9A-F]/i.test(val)) return;

                    const newHex = '#' + val;
                    if (chroma.valid(newHex)) {
                      setChromaColor(chroma(newHex).alpha(1));
                    }
                    setHexInput(val);
                  }}
                  onBlur={() => {
                    setHexInput(chromaColor.hex().slice(1));
                  }}
                />
              </Tip>
            </div>
          </div>

          <div className={styles.recommend}>
            <div>{t('colorDialog.recommendColor')}</div>
            <div className={styles.colorsRow}>
              <Tip title={t('colorDialog.red')}>
                <button
                  onClick={setToRecommend}
                  style={{ background: '#f44336' }}
                />
              </Tip>
              <Tip title={t('colorDialog.pink')}>
                <button
                  onClick={setToRecommend}
                  style={{ background: '#e91e63' }}
                />
              </Tip>
              <Tip title={t('colorDialog.purple')}>
                <button
                  onClick={setToRecommend}
                  style={{ background: '#9c27b0' }}
                />
              </Tip>
              <Tip title={t('colorDialog.deepPurple')}>
                <button
                  onClick={setToRecommend}
                  style={{ background: '#673ab7' }}
                />
              </Tip>
              <Tip title={t('colorDialog.indigo')}>
                <button
                  onClick={setToRecommend}
                  style={{ background: '#3f51b5' }}
                />
              </Tip>
              <Tip title={t('colorDialog.blue')}>
                <button
                  onClick={setToRecommend}
                  style={{ background: '#2196f3' }}
                />
              </Tip>
              <Tip title={t('colorDialog.lightBlue')}>
                <button
                  onClick={setToRecommend}
                  style={{ background: '#03a9f4' }}
                />
              </Tip>
              <Tip title={t('colorDialog.cyan')}>
                <button
                  onClick={setToRecommend}
                  style={{ background: '#00bcd4' }}
                />
              </Tip>
            </div>
            <div className={styles.colorsRow}>
              <Tip title={t('colorDialog.teal')}>
                <button
                  onClick={setToRecommend}
                  style={{ background: '#009688' }}
                />
              </Tip>
              <Tip title={t('colorDialog.green')}>
                <button
                  onClick={setToRecommend}
                  style={{ background: '#4caf50' }}
                />
              </Tip>
              <Tip title={t('colorDialog.lightGreen')}>
                <button
                  onClick={setToRecommend}
                  style={{ background: '#8bc34a' }}
                />
              </Tip>
              <Tip title={t('colorDialog.lime')}>
                <button
                  onClick={setToRecommend}
                  style={{ background: '#cddc39' }}
                />
              </Tip>
              <Tip title={t('colorDialog.yellow')}>
                <button
                  onClick={setToRecommend}
                  style={{ background: '#ffeb3b' }}
                />
              </Tip>
              <Tip title={t('colorDialog.amber')}>
                <button
                  onClick={setToRecommend}
                  style={{ background: '#ffc107' }}
                />
              </Tip>
              <Tip title={t('colorDialog.orange')}>
                <button
                  onClick={setToRecommend}
                  style={{ background: '#ff9800' }}
                />
              </Tip>
              <Tip title={t('colorDialog.deepOrange')}>
                <button
                  onClick={setToRecommend}
                  style={{ background: '#ff5722' }}
                />
              </Tip>
            </div>
          </div>
        </SimpleBar>
      </DialogContent>

      <DialogActions>
        <Button
          variant='outlined'
          onClick={() => {
            onClose();
            const initColor = chroma(color);
            setChromaColor(initColor);
            setHexInput(initColor.hex().slice(1));
          }}
        >
          {t('colorDialog.cancel')}
        </Button>
        <Button
          variant='contained'
          onClick={() => {
            onClose();
            onColorChanged(chromaColor.hex());
          }}
        >
          {t('colorDialog.apply')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
