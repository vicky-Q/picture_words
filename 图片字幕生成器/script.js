document.addEventListener('DOMContentLoaded', () => {
    // DOM元素引用
    const imageUpload = document.getElementById('imageUpload');
    const fileName = document.getElementById('fileName');
    const clearFile = document.getElementById('clearFile');
    const subtitleHeight = document.getElementById('subtitleHeight');
    const fontSize = document.getElementById('fontSize');
    const fontColor = document.getElementById('fontColor');
    const fontColorHex = document.getElementById('fontColorHex');
    const outlineColor = document.getElementById('outlineColor');
    const outlineColorHex = document.getElementById('outlineColorHex');
    const subtitleText = document.getElementById('subtitleText');
    const generateBtn = document.getElementById('generateBtn');
    const saveBtn = document.getElementById('saveBtn');
    const emptyPreview = document.getElementById('emptyPreview');
    const imagePreview = document.getElementById('imagePreview');
    const originalImage = document.getElementById('originalImage');
    const resultCanvas = document.getElementById('resultCanvas');
    const ctx = resultCanvas.getContext('2d');

    // 存储原始图片数据
    let originalImageData = null;

    // 文件上传处理
    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            fileName.textContent = file.name;
            clearFile.disabled = false;
            generateBtn.disabled = false;

            // 显示预览图片
            const reader = new FileReader();
            reader.onload = (event) => {
                originalImage.src = event.target.result;
                originalImage.onload = () => {
                    originalImageData = originalImage;
                    emptyPreview.classList.add('hidden');
                    imagePreview.classList.remove('hidden');
                    // 重置画布
                    resultCanvas.width = originalImage.naturalWidth;
                    resultCanvas.height = originalImage.naturalHeight;
                };
            };
            reader.readAsDataURL(file);
        }
    });

    // 清除文件选择
    clearFile.addEventListener('click', () => {
        imageUpload.value = '';
        fileName.textContent = '未选择文件';
        clearFile.disabled = true;
        generateBtn.disabled = true;
        saveBtn.disabled = true;
        emptyPreview.classList.remove('hidden');
        imagePreview.classList.add('hidden');
        originalImageData = null;
    });

    // 颜色选择器同步
    fontColor.addEventListener('input', () => {
        fontColorHex.value = fontColor.value;
    });

    fontColorHex.addEventListener('input', () => {
        if (/^#[0-9A-Fa-f]{6}$/.test(fontColorHex.value)) {
            fontColor.value = fontColorHex.value;
        }
    });

    outlineColor.addEventListener('input', () => {
        outlineColorHex.value = outlineColor.value;
    });

    outlineColorHex.addEventListener('input', () => {
        if (/^#[0-9A-Fa-f]{6}$/.test(outlineColorHex.value)) {
            outlineColor.value = outlineColorHex.value;
        }
    });

    // 生成字幕图片
    generateBtn.addEventListener('click', () => {
        if (!originalImageData) return;

        // 获取参数
        const lines = subtitleText.value.split('\n').filter(line => line.trim() !== '');
        const lineHeight = parseInt(subtitleHeight.value) || 40;
        const textSize = parseInt(fontSize.value) || 20;
        const textColor = fontColor.value;
        const strokeColor = outlineColor.value;
        const lineCount = lines.length;

        // 计算新画布尺寸（原图高度 + (行数-1)*条带高度）
        const newHeight = originalImageData.naturalHeight + (lineCount > 0 ? (lineCount - 1) * lineHeight : 0);
        resultCanvas.width = originalImageData.naturalWidth;
        resultCanvas.height = newHeight;

        // 设置字体
        ctx.font = `${textSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 绘制原始图片
        ctx.drawImage(originalImageData, 0, 0);

        // 创建临时画布用于切割底部条带
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = originalImageData.naturalWidth;
        tempCanvas.height = lineHeight;

        // 切割原图底部条带（第一行字幕所在区域）
        if (lineCount > 0) {
            tempCtx.drawImage(
                originalImageData,
                0, originalImageData.naturalHeight - lineHeight, // 源图起始点
                originalImageData.naturalWidth, lineHeight, // 源图宽度和高度
                0, 0, // 目标起始点
                tempCanvas.width, tempCanvas.height // 目标宽度和高度
            );
        }

        // 绘制拼接条带和字幕
        lines.forEach((line, index) => {
            let y;
            if (index === 0) {
                // 第一行在原图底部
                y = originalImageData.naturalHeight - lineHeight / 2;
            } else {
                // 后续行：绘制拼接条带并添加文字
                const stripY = originalImageData.naturalHeight + (index - 1) * lineHeight;
                ctx.drawImage(tempCanvas, 0, stripY);
                y = stripY + lineHeight / 2;
            }

            // 绘制文字轮廓
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 2;
            ctx.strokeText(line, resultCanvas.width / 2, y);

            // 绘制文字
            ctx.fillStyle = textColor;
            ctx.fillText(line, resultCanvas.width / 2, y);
        });

        // 启用保存按钮
        saveBtn.disabled = false;
    });

    // 保存图片
    saveBtn.addEventListener('click', () => {
        try {
            // 创建下载链接
            const link = document.createElement('a');
            link.download = 'subtitle-image.png';
            link.href = resultCanvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            alert('保存图片失败: ' + error.message);
        }
    });
});