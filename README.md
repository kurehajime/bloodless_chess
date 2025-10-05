# 無血チェス
https://kurehajime.github.io/bloodless_chess/

[
![](https://github.com/user-attachments/assets/79741040-9a55-4ebe-8e9c-183fa90b4f55)
](https://kurehajime.github.io/bloodless_chess/)

### ルール

* 普通のチェスの駒と同じように動く
* 相手の駒のあるマスに進むと相手の駒をその場で『捕虜』にできる。自分の駒は捕虜監視駒になる
* 相手のキングを捕虜にすると勝利
* 捕虜はその場から動くことができない
* 自分の駒が捕虜にされているマスに自分の駒を移動すると、逆に相手の駒を捕虜にできる。もともと捕虜にされていた自分の駒も捕虜監視駒になる。
* 捕虜監視駒はどちらを動かしても良い
* 捕虜のいるマスから移動して捕虜監視駒がゼロになると捕虜は解放される
* 捕虜は解放された直後のターンに動くことはできない

### セットアップ手順
1. `npm install`
2. `npm run dev`
3. ブラウザで `http://localhost:5173` にアクセス

※ ビルドするときは `npm run build` を実行し、ローカルで確認する場合は `npm run preview` を利用してください。
