import React, { Component } from "react";
import { Routes, Route } from "react-router-dom";
import Context from "./context/context";
import API from "./api";
// Styles
import { GlobalStyle, Wrapper } from "./GlobalStyle";
// Queries
import { currenciesQuery, categoriesQuery } from "./Queries";
// Components
import Navigation from "./routes/Navigation/Navigation";
import CategoryPage from "./pages/CategoryPage/CategoryPage";
import ProductPage from "./pages/ProductPage/ProductPage";
import CartPage from "./pages/CartPage/CartPage";

export default class App extends Component {
  state = {
    categories: [],
    currencies: [],
    product: {},
    selectedCurrency: localStorage.getItem("currency") || 0,
    selectedProducts:
      JSON.parse(localStorage.getItem("SelectedProducts")) || [],
  };

  async componentDidMount() {
    try {
      const categoriesAndcurrencies = await Promise.all([
        API.getData(categoriesQuery),
        API.getData(currenciesQuery),
      ]);
      this.setState({
        categories: [...categoriesAndcurrencies[0].data.data.categories],
      });
      this.setState({
        currencies: [...categoriesAndcurrencies[1].data.data.currencies],
      });
    } catch (error) {
      console.log("error", error);
    }
  }
  // Product
  setProduct(product) {
    this.setState({
      product: {
        ...product.data.data.product,
      },
    });
  }
  // Set chosen currency state in localstorage
  setCurrency(index) {
    this.setState({
      selectedCurrency: localStorage.setItem("currency", index),
    });
  }

  // Want to buy products
  setSelectedProducts(products) {
    this.setState({
      selectedProducts:
        localStorage.setItem("SelectedProducts", JSON.stringify(products)) ||
        products,
    });
  }
  render() {
    const { categories, currencies, product, selectedProducts } = this.state;
    return (
      <Wrapper>
        <Context.Provider
          value={{
            currencies: currencies,
            product: product,
            selectedProducts: selectedProducts,
            categories: categories[0],
            setSelectedProducts: this.setSelectedProducts.bind(this),
          }}
        >
          <Routes>
            <Route
              path="/"
              element={
                <Navigation
                  currencies={currencies}
                  setCurrency={this.setCurrency.bind(this)}
                />
              }
            >
              <Route path={"/cart"} element={<CartPage />} />
              <Route
                path={`/${localStorage.getItem("id")}`}
                element={
                  <ProductPage
                    product={product}
                    setProduct={this.setProduct.bind(this)}
                    setSelectedProducts={this.setSelectedProducts.bind(this)}
                  />
                }
              />
              {
                // Dynamically rendering each category
                categories.map((category) => {
                  const categoryName = category.name;
                  return categoryName === "all" ? (
                    <Route
                      path="/"
                      key={categoryName}
                      element={<CategoryPage category={category} />}
                    />
                  ) : (
                    <Route
                      path={categoryName}
                      key={categoryName}
                      element={<CategoryPage category={category} />}
                    />
                  );
                })
              }
            </Route>
          </Routes>
          <GlobalStyle />
        </Context.Provider>
      </Wrapper>
    );
  }
}
