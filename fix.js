(() => {
  const byId = id => document.getElementById(id);
  const linesOf = text => text.replaceAll(String.fromCharCode(13), '').split(String.fromCharCode(10)).map(x => x.trim()).filter(Boolean);
  const value = (text, labels) => {
    const lines = linesOf(text);
    const rx = new RegExp(`^(?:${labels.join('|')})\\s*[:\\-]?\\s*(.*)$`, 'i');
    for (let i = 0; i < lines.length; i++) { const m = lines[i].match(rx); if (m) return m[1].trim() || lines[i + 1] || ''; }
    return '';
  };
  byId('runOcr').onclick = async () => {
    const file = byId('ocrFile').files[0], status = byId('ocrStatus');
    if (!file) { status.textContent = 'Choose an image or PDF first.'; return; }
    try {
      status.textContent = 'Reading document…';
      const text = file.type === 'application/pdf' ? await pdfText(file, x => status.textContent = x) : await ocrImage(await prepImage(file), x => status.textContent = x);
      byId('otNotes').value = text;
      const set = (id, x) => { if (x) byId(id).value = x; };
      const rawLines = linesOf(text), after = phrase => { const i = rawLines.findIndex(x => x.toLowerCase().replace(/[^a-z]/g,'').includes(phrase)); return i >= 0 ? rawLines[i + 1] || '' : ''; };
      set('name', value(text, ['patient\\s*name']));
      set('age', (value(text, ['age', 'age\\s*\\(years\\)']) || text.match(/\\bage\\b[\\s:]*([0-9]{1,3})/i)?.[1] || '').match(/\\d+/)?.[0]);
      set('age', after('age').match(/[0-9]{1,3}/)?.[0]);
      const gender = value(text, ['gender', 'sex']); if (/female/i.test(gender)) byId('sex').value = 'Female'; else if (/male/i.test(gender)) byId('sex').value = 'Male';
      const dt = (value(text, ['date\\s*of\\s*surgery', 'date\\s*of\\s*procedure']) || text.match(/date\\s*of\\s*(?:surgery|procedure)[\\s:]*([0-9]{1,2}[\\/.-][0-9]{1,2}[\\/.-][0-9]{2,4})/i)?.[1] || '').match(/(\\d{1,2})[\\/.-](\\d{1,2})[\\/.-](\\d{4})/); if (dt) byId('otDate').value = `${dt[3]}-${dt[2].padStart(2,'0')}-${dt[1].padStart(2,'0')}`;
      const rawDate = after('dateofsurgery') || after('dateofprocedure'), dateParts = rawDate.match(/[0-9]{1,2}[\\/.-][0-9]{1,2}[\\/.-][0-9]{4}/)?.[0]?.split(/[\\/.-]/); if (dateParts) byId('otDate').value = `${dateParts[2]}-${dateParts[1].padStart(2,'0')}-${dateParts[0].padStart(2,'0')}`;
      const dateLine = rawLines.find(x => { const z=x.toLowerCase().replace(/[^a-z]/g,''); return z.includes('dateofsurgery') || z.includes('dateofprocedure'); }) || ''; const bits = dateLine.replaceAll('-','/').replaceAll('.','/').split('/').map(x=>x.split('').filter(c=>c>='0'&&c<='9').join('')).filter(Boolean); if (bits.length>=3 && bits[2].length===4) byId('otDate').value = `${bits[2]}-${bits[1].padStart(2,'0')}-${bits[0].padStart(2,'0')}`;
      set('procedure', value(text, ['procedure\\s*performed', 'proposed\\s*procedure']));
      set('operatingSurgeon', value(text, ['surgeon']));
      set('assistantNames', value(text, ['assistant\\s*\\(?s\\)?']));
      set('diagnosis', value(text, ['preoperative\\s*diagnosis']));
      if (/breast/i.test(text)) byId('system').value = 'Breast';
      status.textContent = 'Done — patient and procedure fields filled. Please review.';
    } catch { status.textContent = 'Could not read this file. Try a clearer scan.'; }
  };
  byId('previewCase').onclick=()=>{const p=byId('previewPanel'),g=id=>byId(id).value||'—',data=[['Patient',g('name')],['Age / Sex',`${g('age')} / ${g('sex')}`],['Diagnosis',g('diagnosis')],['Date',g('otDate')],['Procedure',g('procedure')],['Role / System',`${g('role')} / ${g('system')}`],['Operating surgeon',g('operatingSurgeon')],['Assistant(s)',g('assistantNames')],['Pre-op history',g('preOpHistory')],['Pre-op imaging',g('preOpImaging')],['Intra-op notes',g('intraOpNotes')],['Histopathology',g('histopath')],['Follow-up',g('followUp')],['Complications',g('complicationDetails')]];p.innerHTML=`<h2>Case preview — ${g('name')}</h2><div class="preview-actions"><button id="editPreview">Edit</button><button id="pdfPreview">Export PDF</button><button id="pptPreview">Export PowerPoint</button></div><dl>${data.filter(x=>x[1]!=='—').map(x=>`<dt>${x[0]}</dt><dd>${x[1]}</dd>`).join('')}</dl><h3>Clinical images</h3><div class="photos">${photos.map(x=>`<div class="photo"><img src="${x.data}"><span>${x.kind}</span></div>`).join('')}</div>`;p.hidden=false;byId('editPreview').onclick=()=>{p.hidden=true;byId('caseForm').scrollIntoView()};byId('pdfPreview').onclick=()=>window.print();byId('pptPreview').onclick=()=>{const withImages=confirm('Include clinical images in the PowerPoint?');if(!window.PptxGenJS)return alert('PowerPoint library unavailable.');const ppt=new PptxGenJS(),s=ppt.addSlide();s.addText(`OT Case: ${g('name')}`,{x:.5,y:.4,w:9,h:.4,fontSize:24,bold:true});let y=1;data.filter(x=>x[1]!=='—').forEach(x=>{s.addText(`${x[0]}: ${x[1]}`,{x:.6,y,w:8.7,h:.3,fontSize:13});y+=.38});if(withImages)photos.forEach(x=>{const a=ppt.addSlide();a.addText(x.kind,{x:.5,y:.3,w:8,h:.3,fontSize:22,bold:true});a.addImage({data:x.data,x:1,y:.8,w:8,h:5.5})});ppt.writeFile({fileName:`${g('name').replace(/[^a-z0-9]/gi,'_')}_OT_case.pptx`})}};
})();
