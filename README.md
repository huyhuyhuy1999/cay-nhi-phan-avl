# cay-nhi-phan-avl

Website demo cay AVL truc quan phuc vu thuyet trinh. Du an la web tinh, khong can build, khong can cai framework.

## Co gi trong bo demo

- Mo phong cay AVL bang SVG, co animation node di chuyen khi xoay.
- Code AVL duoc to sang theo buoc dang chay.
- Nhat ky debug theo tung thao tac chen/xoa.
- Moi case deu co san cay ban dau, chi tap trung vao 1 thao tac minh hoa, khong replay dai dong.

## Cau truc file

- `index.html`: giao dien web.
- `styles.css`: giao dien, bo cuc, responsive, che do trinh chieu.
- `app.js`: logic AVL, scenario demo, animation, debug log.

## Cach chay web tai may tu A-Z

### Cach 1: Mo truc tiep

1. Tai hoac clone source ve may.
2. Mo thu muc du an.
3. Nhan dup vao `index.html`.
4. Website se mo bang trinh duyet mac dinh.

### Cach 2: Chay bang local server

Cach nay on dinh hon neu ban muon demo tren nhieu may.

1. Cai Python 3 neu may chua co.
2. Mo PowerShell trong thu muc du an.
3. Chay lenh:

```powershell
python -m http.server 8000
```

4. Mo trinh duyet va vao:

```text
http://localhost:8000
```

5. Khi muon dung server, quay lai PowerShell va nhan `Ctrl + C`.

## Cach dua len GitHub public tu A-Z

### Buoc 1: Tao repo public tren GitHub

1. Dang nhap [GitHub](https://github.com).
2. Bam `New repository`.
3. Dat ten repo, vi du: `avl-demo-web`.
4. Chon `Public`.
5. Bam `Create repository`.

### Buoc 2: Day code len repo

Mo PowerShell trong thu muc du an va chay:

```powershell
git init -b main
git add .
git commit -m "Initial public release"
git remote add origin https://github.com/<github-username>/<ten-repo>.git
git push -u origin main
```

Neu repo da duoc `git init` roi thi chi can chay:

```powershell
git add .
git commit -m "Update AVL demo"
git push
```

### Buoc 3: Bat GitHub Pages de host website

1. Vao repo tren GitHub.
2. Vao `Settings`.
3. Chon `Pages`.
4. Tai `Build and deployment`:
   - `Source`: chon `Deploy from a branch`
   - `Branch`: chon `main`
   - `Folder`: chon `/ (root)`
5. Bam `Save`.

### Buoc 4: Lay link website public

Sau 1-3 phut, web se co link dang:

```text
https://<github-username>.github.io/<ten-repo>/
```

## Cach cap nhat web sau nay

1. Sua file `index.html`, `styles.css`, `app.js`.
2. Chay:

```powershell
git add .
git commit -m "Cap nhat demo AVL"
git push
```

3. Doi GitHub Pages deploy lai.

## Ghi chu

- Day la web tinh, khong can `npm install`.
- Khong can database, backend, hay hosting rieng.
- Ban co the dung ngay bang file `index.html` hoac host bang GitHub Pages.
