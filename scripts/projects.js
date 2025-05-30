// 加载项目数据并渲染
document.addEventListener('DOMContentLoaded', function() {
  // 从JSON文件加载项目数据
  fetch('data/projects.json')
    .then(response => response.json())
    .then(projects => {
      // 渲染项目表格
      renderProjectsTable(projects);
      
      // 渲染项目卡片
      renderProjectCards(projects);
    })
    .catch(error => {
      console.error('Error loading projects:', error);
      // 如果加载失败，可以使用默认数据或显示错误信息
    });
});

// 渲染项目表格
function renderProjectsTable(projects) {
  const tableBody = document.getElementById('projects-table-body');
  
  // 清空表格
  tableBody.innerHTML = '';
  
  // 生成表格行
  projects.forEach(project => {
    const row = document.createElement('tr');
    row.className = 'hover:bg-gray-50 transition-colors';
    
    row.innerHTML = `
      <td class="border border-gray-300 p-4">${project.name}</td>
      <td class="border border-gray-300 p-4">${project.type}</td>
      <td class="border border-gray-300 p-4">${project.techStack}</td>
      <td class="border border-gray-300 p-4">
        <span class="px-3 py-1 ${project.statusClass} rounded-full text-sm">${project.status}</span>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
}

// 渲染项目卡片
function renderProjectCards(projects) {
  const container = document.getElementById('projects-container');
  
  // 清空容器中的项目卡片（保留预留空间）
  const placeholder = container.lastElementChild;
  container.innerHTML = '';
  container.appendChild(placeholder);
  
  // 生成项目卡片
  projects.forEach(project => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl overflow-hidden shadow-lg group portfolio-item';
    
    // 检查是否为视频项目
    const mediaContent = project.isVideo 
      ? `
        <div class="relative overflow-hidden">
          <div class="aspect-video relative">
            <video autoplay muted loop class="w-full h-full object-cover">
              <source src="${project.image}" type="video/mp4">
            </video>
            <div class="absolute inset-0 flex items-center justify-center">
              <button class="bg-white/80 text-primary w-12 h-12 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                <i class="fa fa-pause"></i>
              </button>
            </div>
          </div>
          <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button class="bg-white text-primary px-4 py-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">查看详情</button>
          </div>
        </div>
      `
      : `
        <div class="relative overflow-hidden">
          <img src="${project.image}" alt="${project.name}" class="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110">
          <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button class="bg-white text-primary px-4 py-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">查看详情</button>
          </div>
        </div>
      `;
    
    card.innerHTML = `
      ${mediaContent}
      <div class="p-6">
        <h3 class="text-xl font-bold mb-2">${project.name}</h3>
        <p class="text-gray-600 mb-4">${project.description}</p>
        <div class="flex flex-wrap gap-2 mb-4">
          ${project.tags.map(tag => `<span class="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">${tag}</span>`).join('')}
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-500 text-sm">${project.date}</span>
          <a href="#" class="text-primary hover:underline flex items-center">
            查看项目 <i class="fa fa-arrow-right ml-1"></i>
          </a>
        </div>
      </div>
    `;
    
    container.insertBefore(card, placeholder);
  });
}  