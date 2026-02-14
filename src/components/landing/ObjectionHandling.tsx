import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "É complicado integrar?",
    a: "Não. Nossa API é RESTful com documentação completa. A integração leva menos de 1 hora. Temos SDKs para as principais linguagens e exemplos prontos para CRMs populares.",
  },
  {
    q: "Funciona para o meu caso de uso?",
    a: "Se você envia emails — marketing, transacional, cold outreach — o Gold Mail Validator otimiza seus resultados. Empresas de todos os tamanhos usam: de startups a enterprises com milhões de contatos.",
  },
  {
    q: "E se não funcionar para mim?",
    a: "Você começa grátis, sem cartão de crédito. Teste com seus próprios emails e veja os resultados antes de investir. Não há lock-in nem contratos longos.",
  },
  {
    q: "Meus dados estão seguros?",
    a: "Sim. Toda comunicação é criptografada com TLS. Operamos com isolamento multi-tenant, RLS no banco de dados e controle de acesso baseado em roles. Seus dados nunca são compartilhados.",
  },
  {
    q: "Qual a diferença para outras ferramentas?",
    a: "Vamos além da validação de sintaxe. Nosso motor proprietário faz handshake SMTP, análise de reputação de domínio, detecção de catch-all e gera um score de confiança de 0-100 para cada email.",
  },
];

const ObjectionHandling = () => {
  return (
    <section className="py-24">
      <div className="max-w-[800px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Perguntas frequentes
          </h2>
          <p className="text-muted-foreground">
            Tudo que você precisa saber antes de começar.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-xl border border-border/50 bg-gradient-card px-6 data-[state=open]:border-primary/20"
              >
                <AccordionTrigger className="text-sm font-medium hover:no-underline py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default ObjectionHandling;
