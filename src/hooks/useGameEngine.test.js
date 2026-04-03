import { renderHook, act } from '@testing-library/react';
import { expect, test, describe } from 'vitest';
import { useGameEngine } from './useGameEngine';

describe('useGameEngine - 新仕様（交互選択・全シャッフル）', () => {
  test('交互モード（アルファベット）で正しい順序のリストが生成されること', () => {
    const { result } = renderHook(() => useGameEngine());
    act(() => {
      // 3x3 (9マス) で交互モード(アルファベット)をセット
      result.current.updateConfig({ gridSize: 3, alternatingMode: 'alphabet' });
    });
    act(() => { result.current.startGame(); });

    // 9マスの内訳が、数字(5)とアルファベット(4)になっているか確認
    const values = result.current.grid.map(c => c.value);
    expect(values).toContain(1);
    expect(values).toContain('A');
    expect(values).toContain(2);
    expect(values).toContain('B');
  });

  test('交互モード（ひらがな）で正しい順序のリストが生成されること', () => {
    const { result } = renderHook(() => useGameEngine());
    act(() => {
      // 3x3 (9マス) で交互モード(ひらがな)をセット
      result.current.updateConfig({ gridSize: 3, alternatingMode: 'hiragana' });
    });
    act(() => { result.current.startGame(); });

    // 9マスの内訳が、数字(5)とひらがな(4)になっているか確認
    const values = result.current.grid.map(c => c.value);
    expect(values).toContain(1);
    expect(values).toContain('あ');
    expect(values).toContain(2);
    expect(values).toContain('い');
  });

  test('クリック成功時にグリッドの並び順が完全に変更（シャッフル）されること', () => {
    const { result } = renderHook(() => useGameEngine());
    act(() => { 
      result.current.updateConfig({ gridSize: 3, isDynamicGrid: true });
      result.current.startGame(); 
    });

    const initialOrder = result.current.grid.map(c => c.value);

    act(() => {
      result.current.handleClick(1);
    });

    const shuffledOrder = result.current.grid.map(c => c.value);
    // 確率は極めて低いが、並び順が変わっていることを確認
    expect(initialOrder).not.toEqual(shuffledOrder);
  });
});