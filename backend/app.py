import os
import math
from flask import Flask, jsonify, request, Response
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client, Client
from datetime import datetime
from dateutil.relativedelta import relativedelta
from typing import Dict, Any
from fpdf import FPDF

# 1. CONFIGURAÇÃO
load_dotenv()
app = Flask(__name__)

# 🔧 CORS atualizado para aceitar local e produção (Vercel)
origins = [
    "http://localhost:5173",  # Para desenvolvimento local
    "https://edyfinance-pro.vercel.app"  # Para produção na Vercel
]
CORS(app, resources={r"/api/*": {"origins": origins}})

url: str = os.environ.get("SUPABASE_URL")
service_key: str = os.environ.get("SUPABASE_SERVICE_KEY")
supabase_admin: Client = create_client(url, service_key)

# 2. FUNÇÕES DE LÓGICA DE NEGÓCIO
class PDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, 'Comprovante de Aceite de Proposta de Renegociação', 0, 1, 'C')
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Página {self.page_no()}', 0, 0, 'C')

def gerar_pdf_proposta(proposta_data: Dict[str, Any], cliente_nome: str) -> bytes:
    pdf = PDF()
    pdf.add_page()
    pdf.set_font('Arial', '', 12)
    pdf.cell(0, 10, f"Cliente: {cliente_nome}", 0, 1)
    pdf.cell(0, 10, f"Data do Acordo: {datetime.now().strftime('%d/%m/%Y')}", 0, 1)
    pdf.cell(0, 10, f"ID do Empréstimo Renegociado: {proposta_data.get('emprestimo_id', 'N/A')}", 0, 1)
    pdf.ln(10)
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(0, 10, 'Detalhes da Proposta Aceita', 0, 1, 'C')
    pdf.ln(5)
    pdf.set_font('Arial', '', 12)
    pdf.cell(0, 10, f"Saldo Devedor Original: R$ {proposta_data.get('saldo_devedor_original', 0):.2f}", 0, 1)
    pdf.cell(0, 10, f"Desconto Aplicado ({proposta_data.get('percentual_desconto_aplicado', 0)}%): - R$ {proposta_data.get('valor_do_desconto', 0):.2f}", 0, 1)
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 10, f"VALOR FINAL PARA QUITAÇÃO: R$ {proposta_data.get('valor_final_para_quitacao', 0):.2f}", 0, 1)
    pdf.ln(10)
    pdf.set_font('Arial', 'I', 10)
    pdf.multi_cell(0, 5, 'Este documento serve como comprovante do aceite da proposta... O boleto será enviado em até 2 dias úteis.')
    return pdf.output(dest='S').encode('latin1')

def calcular_detalhes_emprestimo(emprestimo: Dict[str, Any], data_referencia_str: str) -> Dict[str, Any]:
    data_referencia = datetime.strptime(data_referencia_str, '%Y-%m-%d').date()
    if not emprestimo.get('data_ultima_parcela'):
        return {"error": f"Empréstimo ID {emprestimo.get('id')} sem data final."}
    
    ultima_parcela = datetime.strptime(emprestimo['data_ultima_parcela'], '%Y-%m-%d').date()
    qtd_total_parcelas = emprestimo['quantidade_parcelas']
    valor_parcela = float(emprestimo['valor_parcela'])
    primeira_parcela = ultima_parcela - relativedelta(months=qtd_total_parcelas - 1)
    
    parcelas_pagas = (data_referencia.year - primeira_parcela.year) * 12 + (data_referencia.month - primeira_parcela.month)
    if data_referencia.day >= primeira_parcela.day:
        parcelas_pagas += 1
    parcelas_pagas = max(0, min(parcelas_pagas, qtd_total_parcelas))
    
    parcelas_a_vencer = qtd_total_parcelas - parcelas_pagas
    valor_ja_pago = parcelas_pagas * valor_parcela
    valor_a_vencer = parcelas_a_vencer * valor_parcela
    proxima_parcela_data = primeira_parcela + relativedelta(months=parcelas_pagas)
    
    return {
        "primeira_parcela": primeira_parcela.strftime('%d/%m/%Y'),
        "parcelas_pagas": parcelas_pagas,
        "a_vencer": parcelas_a_vencer,
        "valor_ja_pago": round(valor_ja_pago, 2),
        "valor_a_vencer": round(valor_a_vencer, 2),
        "proxima_parcela": proxima_parcela_data.strftime('%d/%m/%Y') if parcelas_a_vencer > 0 else "Quitado"
    }

def calcular_proposta_renegociacao(valor_a_vencer: float, parcelas_a_vencer: int) -> Dict[str, Any]:
    percentual_desconto = 0.0
    if 1 <= parcelas_a_vencer <= 20:
        percentual_desconto = 0.35
    elif 21 <= parcelas_a_vencer <= 40:
        percentual_desconto = 0.40
    elif 41 <= parcelas_a_vencer <= 60:
        percentual_desconto = 0.45
    elif 61 <= parcelas_a_vencer <= 80:
        percentual_desconto = 0.50
    elif 81 <= parcelas_a_vencer <= 100:
        percentual_desconto = 0.55
    elif 101 <= parcelas_a_vencer <= 120:
        percentual_desconto = 0.60

    valor_desconto = valor_a_vencer * percentual_desconto
    valor_final_com_desconto = valor_a_vencer - valor_desconto
    return {
        "saldo_devedor_original": round(valor_a_vencer, 2),
        "parcelas_restantes": parcelas_a_vencer,
        "percentual_desconto_aplicado": int(percentual_desconto * 100),
        "valor_do_desconto": round(valor_desconto, 2),
        "valor_final_para_quitacao": round(valor_final_com_desconto, 2)
    }

def calcular_parcelamento_price(valor_total: float, taxa_juros_mensal: float, num_parcelas: int) -> float:
    if num_parcelas <= 0:
        return 0
    if taxa_juros_mensal == 0:
        valor_parcela = valor_total / num_parcelas
    else:
        i, n = taxa_juros_mensal, num_parcelas
        valor_parcela = valor_total * (i * ((1 + i)**n)) / (((1 + i)**n) - 1)
    return math.ceil(valor_parcela)

# 3. ENDPOINTS DA API
@app.route("/")
def home():
    return jsonify({"status": "API Flask de Renegociação Online!"})

@app.route("/api/cliente/analise/<uuid:cliente_id>", methods=["GET"])
def analisar_cliente(cliente_id: str):
    try:
        response = supabase_admin.table('emprestimos').select('*').eq('cliente_id', str(cliente_id)).execute()
        emprestimos = response.data
        if not emprestimos:
            return jsonify({"emprestimos": [], "message": "Nenhum empréstimo encontrado."}), 200
        
        data_ref = datetime.now().strftime('%Y-%m-%d')
        resultados = [
            {**e, **calcular_detalhes_emprestimo(e, data_ref)}
            for e in emprestimos
        ]
        resumo = {
            "total_emprestado": sum(float(e.get('valor_total_emprestimo', 0)) for e in emprestimos),
            "total_pago": sum(r.get('valor_ja_pago', 0) for r in resultados),
            "total_a_vencer": sum(r.get('valor_a_vencer', 0) for r in resultados),
            "emprestimos": resultados
        }
        return jsonify(resumo)
    except Exception as e:
        return jsonify({"error": f"Erro interno: {str(e)}"}), 500

@app.route("/api/proposta/renegociar-multiplos", methods=["POST"])
def renegociar_multiplos_emprestimos():
    data = request.get_json()
    loan_ids = data.get('loan_ids')
    if not loan_ids:
        return jsonify({"error": "Nenhum empréstimo selecionado."}), 400
    try:
        response = supabase_admin.table('emprestimos').select('*').in_('id', loan_ids).execute()
        emprestimos = response.data
        saldo_devedor_total = sum(calcular_detalhes_emprestimo(e, datetime.now().strftime('%Y-%m-%d')).get('valor_a_vencer', 0) for e in emprestimos)
        taxa_juros = 0.005
        propostas = [
            {"numero_parcelas": n, "valor_parcela": calcular_parcelamento_price(saldo_devedor_total, taxa_juros, n)}
            for n in range(3, 121, 3)
        ]
        return jsonify({
            "saldo_devedor_total": round(saldo_devedor_total, 2),
            "taxa_juros_aplicada": "0.5% a.m.",
            "opcoes_parcelamento": propostas
        })
    except Exception as e:
        return jsonify({"error": f"Erro ao processar: {str(e)}"}), 500

# 4. INICIALIZAÇÃO DO SERVIDOR
if __name__ == "__main__":
    app.run(debug=True)
