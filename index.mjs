export const handler = async (event) => {
  console.log("🔹 Evento recebido:", JSON.stringify(event, null, 2));

  let data = {
    name: event.name ?? "",
    email: event.email ?? "",
    phone: event.phone ?? "",
    address: event.address ?? {},
    amount: event.amount ?? 0,
    methodPayment: event.methodPayment ?? [],
  };

  if (!data.name || !data.email || !data.phone || data.amount <= 0 || data.methodPayment.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Campos obrigatórios: name, email, phone, address, amount válido e pelo menos um método de pagamento.",
      }),
    };
  }

  const totalPaid = data.methodPayment.reduce((sum, payment) => sum + payment.amount, 0);
  if (totalPaid !== data.amount) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "A soma dos métodos de pagamento não corresponde ao valor total.",
        expected: data.amount,
        received: totalPaid,
      }),
    };
  }

  try {
    const processPayment = async (method, amount, cardNumber, installments) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (amount > 0) {
            resolve({
              status: "success",
              method,
              transactionId: Math.random().toString(36).substr(2, 9),
              cardNumber: cardNumber ?? "N/A",
              installments: installments ?? 1,
            });
          } else {
            reject(new Error(`Pagamento inválido com ${method}.`));
          }
        }, 2000);
      });
    };

    const paymentResults = await Promise.all(
      data.methodPayment.map(({ method, amount, cardNumber, installments }) =>
        processPayment(method, amount, cardNumber, installments)
      )
    );

    const orderData = {
      orderId: Math.random().toString(36).substr(2, 9),
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      totalAmount: data.amount,
      transactions: paymentResults,
      status: "Aprovado",
      createdAt: new Date().toISOString(),
    };

    console.log("✅ Pagamento realizado com sucesso:", JSON.stringify(orderData, null, 2));

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Pagamento realizado com sucesso!",
        order: orderData,
      }),
    };
  } catch (error) {
    console.error("❌ Erro no processamento:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erro no processamento", details: error.message }),
    };
  }
};
