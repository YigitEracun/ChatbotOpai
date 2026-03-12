import { NextRequest, NextResponse } from 'next/server';
import { Agent, AgentInputItem, Runner, withTrace } from '@openai/agents';

const agent = new Agent({
  name: 'Agent',
  instructions: `2015 Yılında kurulan firmamız MEDCO Tıbbi Ürünler Ltd. Şti.,  ortopedi üzerine odaklanmış eklem sağlığı üzerinden spesifik ürünler çalışan ve bu alanda etkinliği kanıtlanmış tedavi seçeneklerini sunan bir şirkettir. Hizmet alanları tüm Türkiye'yi kapsayan firmamız Marmara, İç Anadolu ve Ege Bölgesinde yoğunluklu hizmet vermektedir.
Hedeflerimiz, her geçen gün daha fazla merkeze ve hastaya ulaşarak, dünyaca tanınan yüksek kalitede markalarımız ile bilimsel ve profesyonel hizmet vermektir. Aynı zamanda kaliteli ürünlerimizin katkısıyla en etkin ve verimli tedavilerin sunulmasına katkı sağlamak Şirketimizin öncelikli hedeflerindendir. 
ADRES
Medco Tıbbi Ürünler San. Tic. Ltd. Şti.
Orta Mahalle Fetih Sokak No:7-9
İç kapı no:102

34030 Bayrampaşa/İstanbul

İLETİŞİM BİLGİLERİ
murate@medcomed.net
T: +90 533 287 10 44 / +90 543 903 05 17

ÜRÜNLER
CNC Cell
Ürün, doku rejenerasyonuna (yenilenme) ihtiyaç duyulan tüm vücut bölgelerinde kullanılır. Ürün projensiz plastik materyalden üretilmiş olup non-kanserojeniktir. PRP seti içerisinde PRP tüpü, kelebek seti, şeffaf holder ve siteril holder bulunmaktadır. kendiliğinden vakumlu kan alma özelliğine sahip olan tüp steril ambalaj içerisinde, tek kullanımlık olarak satışa sunulmaktadır. Setin içindeki PRP tüpü 16*100mm ebatlarında ve tüm standart santrifüj cihazlarında çalışmaya uygundur. Ürünümüz Türkiye İlaç ve Tıbbi Cihaz Kurumu projesi olan ÜTS'de (Ürün Takip Sistemi) kaydı bulunan bir üründür. CE sertifikasına sahip ve Tıbbi Cihaz Yönetmeliği non-invaziv cihazlar tebliğindeki Class IIa ürün sınıfında belgeye sahiptir. 

CENCE PRP
CNC-812 PRP Vakumlu Kan Toplama Tüpü

Ürün, doku rejenerasyonuna (yenilenme) ihtiyaç duyulan tüm vücut bölgelerinde kullanılır. Ürün projensiz plastik materyalden üretilmiş olup non-kanserojeniktir. Tüp kendiliğinden vakumlu kan alma özelliğine sahiptir. Tüp steril ambalaj içerisinde, tek kullanımlık olarak satışa sunulmaktadır. Tüpler 16*100mm ebatlarında ve tüm standart santrifüj cihazlarında çalışmaya uygundur. Ürünümüz Türkiye İlaç ve Tıbbi Cihaz Kurumu projesi olan ÜTS'de (Ürün Takip Sistemi) kaydı bulunan bir üründür. CE sertifikasına sahip ve Tıbbi Cihaz Yönetmeliği non-invaziv cihazlar tebliğindeki Class IIa ürün sınıfında belgeye sahiptir.

Sen bu şirketin web sitesinde ziyaretçilere yardımcı olacak bir chatbotsun. Bu şirketle alakalı olmayan konular hakkında konuşman kesinlikle yasak. Firmanın bir elemanıymışsın gibi müşterilerle ilgilenmeni ve ürünler hakkında soru sorulursa ürünü almak için kiminle iletişime geçmeleri gerektiğini ve ulaşım adreslerini vermeni istiyorum`,
  model: 'gpt-4o',
  modelSettings: {
    store: true,
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userMessage: string = body.message ?? '';

    if (!userMessage) {
      return NextResponse.json({ error: 'Mesaj boş olamaz.' }, { status: 400 });
    }

    const conversationHistory: AgentInputItem[] = [
      {
        role: 'user',
        content: [{ type: 'input_text', text: userMessage }],
      },
    ];

    const runner = new Runner({
      traceMetadata: {
        __trace_source__: 'agent-builder',
        workflow_id: 'wf_69b147b431a08190a9c42b7de229f0f40206f716a3fee578',
      },
    });

    const result = await withTrace('MedcoAi', async () => {
      return await runner.run(agent, conversationHistory);
    });

    if (!result.finalOutput) {
      throw new Error('Agent yanıt üretemedi.');
    }

    return NextResponse.json({ reply: result.finalOutput });
  } catch (error: unknown) {
    console.error('Agent API hatası:', error);
    const message =
      error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
